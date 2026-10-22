import java.awt.Desktop;
import java.io.BufferedReader;
import java.io.File;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.net.URI;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * UNIS - Unified Network for Institutional Service
 * Fast Application Launcher & Orchestrator
 *
 * Starts Spring Boot backend (port 8080), React/Vite frontend (port 5173),
 * verifies MySQL readiness, health-checks endpoints, and launches Google Chrome.
 *
 * Usage:
 *   java run.java               (Fast incremental launch, reuses valid artifacts)
 *   java run.java --build       (Forces incremental backend rebuild)
 *   java run.java --clean       (Forces full clean package build)
 */
public class run {

    private static final int BACKEND_PORT = 8080;
    private static final int FRONTEND_PORT = 5173;
    private static final int MYSQL_PORT = 3306;
    private static final String APP_URL = "http://localhost:5173/login";
    private static final String BACKEND_HEALTH_URL = "http://127.0.0.1:8080/api/auth/csrf";

    private static final List<Process> launchedProcesses = new ArrayList<>();
    private static boolean isVerbose = false;

    public static void main(String[] args) {
        boolean forceBuild = false;
        boolean cleanBuild = false;

        for (String arg : args) {
            if ("--build".equalsIgnoreCase(arg) || "--rebuild".equalsIgnoreCase(arg)) forceBuild = true;
            if ("--clean".equalsIgnoreCase(arg)) cleanBuild = true;
            if ("--verbose".equalsIgnoreCase(arg) || "-v".equalsIgnoreCase(arg)) isVerbose = true;
        }

        printBanner();

        // 1. Resolve project root
        File rootDir = resolveProjectRoot();
        System.out.println("[INIT] Project root located: " + rootDir.getAbsolutePath());

        File backendDir = new File(rootDir, "backend");
        File frontendDir = new File(rootDir, "frontend");

        if (!backendDir.isDirectory() || !frontendDir.isDirectory()) {
            System.err.println("[ERROR] Required 'backend' or 'frontend' directory not found in " + rootDir.getAbsolutePath());
            System.exit(1);
        }

        // Register clean shutdown hook
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("\n[SHUTDOWN] Stopping all UNIS background services...");
            for (Process p : launchedProcesses) {
                try {
                    if (p != null && p.isAlive()) {
                        p.descendants().forEach(ProcessHandle::destroyForcibly);
                        p.destroyForcibly();
                    }
                } catch (Exception ignored) {}
            }
            System.out.println("[SHUTDOWN] Services stopped cleanly. Goodbye!");
        }));

        // 2. Pre-flight checks: MySQL database connection
        System.out.println("[CHECK] Verifying MySQL connection on port " + MYSQL_PORT + "...");
        if (!isPortOpen("127.0.0.1", MYSQL_PORT, 2000)) {
            System.err.println("--------------------------------------------------------------------------------");
            System.err.println("[ERROR] MySQL database does NOT appear to be responding on port " + MYSQL_PORT + "!");
            System.err.println("Please make sure MySQL is started (e.g. Windows service MySQL84 or Docker)");
            System.err.println("Expected connection: root:1234 on database 'unis_db'");
            System.err.println("--------------------------------------------------------------------------------");
            System.out.print("[PROMPT] Continue anyway? (y/N): ");
            try {
                BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
                String input = reader.readLine();
                if (input == null || !input.trim().equalsIgnoreCase("y")) {
                    System.out.println("[ABORT] Startup cancelled. Please start MySQL and try again.");
                    System.exit(1);
                }
            } catch (Exception e) {
                System.exit(1);
            }
        } else {
            System.out.println("[OK] MySQL service detected and reachable on port " + MYSQL_PORT + ".");
        }

        checkCommandAvailable("npm", "Node.js / npm is required to run the React frontend.");

        // 3. Start Backend if not already running
        boolean backendAlreadyRunning = isPortOpen("127.0.0.1", BACKEND_PORT, 1500);
        if (backendAlreadyRunning) {
            System.out.println("[INFO] Port " + BACKEND_PORT + " is already active. Checking if UNIS backend is responding...");
            if (isHttpReady(BACKEND_HEALTH_URL, 3000)) {
                System.out.println("[OK] Existing UNIS backend instance detected and healthy on port " + BACKEND_PORT + ".");
            } else {
                System.out.println("[WARN] Port " + BACKEND_PORT + " is occupied, but health check did not respond. Attempting to start jar...");
                startBackend(backendDir, rootDir, forceBuild, cleanBuild);
            }
        } else {
            startBackend(backendDir, rootDir, forceBuild, cleanBuild);
        }

        // Wait for Backend to be healthy
        System.out.println("[WAIT] Waiting for Spring Boot backend readiness...");
        if (!waitForHttpReady(BACKEND_HEALTH_URL, 75)) {
            System.err.println("[ERROR] Spring Boot backend failed to become healthy within 75 seconds.");
            System.err.println("Please inspect the backend log messages above for details.");
            System.exit(1);
        }
        System.out.println("[OK] Spring Boot backend is UP and ready!");

        // 4. Start Frontend if not already running
        boolean frontendAlreadyRunning = isPortOpen("127.0.0.1", FRONTEND_PORT, 1500);
        if (frontendAlreadyRunning) {
            System.out.println("[INFO] Port " + FRONTEND_PORT + " is already active. Checking if Vite server is serving...");
            if (isHttpReady("http://127.0.0.1:5173/", 2000)) {
                System.out.println("[OK] Existing Vite frontend server detected on port " + FRONTEND_PORT + ".");
            } else {
                startFrontend(frontendDir);
            }
        } else {
            startFrontend(frontendDir);
        }

        // Wait for Frontend to be reachable
        System.out.println("[WAIT] Waiting for Vite frontend readiness...");
        if (!waitForHttpReady("http://127.0.0.1:5173/", 30)) {
            System.err.println("[ERROR] Frontend failed to respond within 30 seconds.");
            System.exit(1);
        }
        System.out.println("[OK] Vite frontend is UP and serving at " + APP_URL);

        // 5. Open in Chrome only after both services are verified ready
        openBrowser(APP_URL);

        // 6. Running loop
        System.out.println("\n================================================================================");
        System.out.println("  UNIS is actively running!");
        System.out.println("  Access URL: " + APP_URL);
        System.out.println("  Local Development Credentials:");
        System.out.println("    Student Login:       Rahul@gmail.com / Rahul@123  (Computer Engineering)");
        System.out.println("    Administrator Login: Admin@hotmail.com / Administrator@123");
        System.out.println("  Tip: Pass --verbose to display detailed framework/build logs.");
        System.out.println("  Type 'q' and press Enter (or press Ctrl+C) to terminate all services.");
        System.out.println("================================================================================\n");

        try (BufferedReader in = new BufferedReader(new InputStreamReader(System.in))) {
            while (true) {
                String line = in.readLine();
                if (line == null || "q".equalsIgnoreCase(line.trim()) || "exit".equalsIgnoreCase(line.trim())) {
                    break;
                }
            }
        } catch (Exception ignored) {}

        System.exit(0);
    }

    private static File resolveProjectRoot() {
        File current = new File(System.getProperty("user.dir")).getAbsoluteFile();
        if (new File(current, "backend").isDirectory() && new File(current, "frontend").isDirectory()) {
            return current;
        }
        File parent = current.getParentFile();
        if (parent != null && new File(parent, "backend").isDirectory() && new File(parent, "frontend").isDirectory()) {
            return parent;
        }
        return current;
    }

    private static void startBackend(File backendDir, File rootDir, boolean forceBuild, boolean cleanBuild) {
        File jarFile = new File(backendDir, "target/unis-backend-1.0.0.jar");

        boolean needBuild = forceBuild || cleanBuild || !jarFile.exists() || areSourcesNewerThanJar(backendDir, jarFile);

        if (needBuild) {
            System.out.println("[BUILD] Compiling UNIS Spring Boot backend package (incremental mode)...");
            runMavenBuild(backendDir, rootDir, cleanBuild);
        } else {
            System.out.println("[FAST-START] Reusing up-to-date compiled backend package: " + jarFile.getName());
        }

        System.out.println("[LAUNCH] Starting Spring Boot (Java 21) from jar: " + jarFile.getName());
        try {
            ProcessBuilder pb = new ProcessBuilder("java", "-jar", jarFile.getAbsolutePath());
            pb.directory(backendDir);
            pb.redirectErrorStream(true);
            Process p = pb.start();
            launchedProcesses.add(p);
            pipeOutputAsync(p.getInputStream(), "[BACKEND]");
        } catch (Exception e) {
            System.err.println("[ERROR] Failed to start backend process: " + e.getMessage());
            System.exit(1);
        }
    }

    private static boolean areSourcesNewerThanJar(File backendDir, File jarFile) {
        if (!jarFile.exists()) return true;
        long jarTime = jarFile.lastModified();
        File srcDir = new File(backendDir, "src/main");
        return checkNewerFiles(srcDir, jarTime);
    }

    private static boolean checkNewerFiles(File dir, long targetTime) {
        if (dir == null || !dir.exists()) return false;
        File[] files = dir.listFiles();
        if (files == null) return false;
        for (File f : files) {
            if (f.isDirectory()) {
                if (checkNewerFiles(f, targetTime)) return true;
            } else if (f.lastModified() > targetTime) {
                return true;
            }
        }
        return false;
    }

    private static void runMavenBuild(File backendDir, File rootDir, boolean cleanBuild) {
        String mvnCmd = findMavenCommand(rootDir);
        System.out.println("[MAVEN] Using command: " + mvnCmd + " (" + (cleanBuild ? "clean package" : "compile package") + ")");
        try {
            ProcessBuilder pb;
            List<String> command = new ArrayList<>();
            if (isWindows()) {
                command.add("cmd.exe");
                command.add("/c");
                command.add(mvnCmd);
            } else {
                command.add(mvnCmd);
            }

            if (cleanBuild) {
                command.add("clean");
            } else {
                command.add("compile");
            }
            command.add("package");
            command.add("-DskipTests");

            pb = new ProcessBuilder(command);
            pb.directory(backendDir);
            pb.redirectErrorStream(true);
            Process p = pb.start();
            pipeOutputAsync(p.getInputStream(), "[MAVEN]");
            int exitCode = p.waitFor();
            if (exitCode != 0) {
                System.err.println("[ERROR] Maven package build failed with exit code " + exitCode);
                System.exit(1);
            }
        } catch (Exception e) {
            System.err.println("[ERROR] Maven build exception: " + e.getMessage());
            System.exit(1);
        }
    }

    private static String findMavenCommand(File rootDir) {
        File rootMvnCmd = new File(rootDir, "mvn.cmd");
        if (rootMvnCmd.exists()) {
            return rootMvnCmd.getAbsolutePath();
        }
        File localMvn = new File("C:\\Users\\Siddhesh\\tools\\apache-maven-3.9.6\\bin\\mvn.cmd");
        if (localMvn.exists()) {
            return localMvn.getAbsolutePath();
        }
        return "mvn";
    }

    private static void startFrontend(File frontendDir) {
        System.out.println("[LAUNCH] Starting React/Vite development server on port " + FRONTEND_PORT + "...");
        try {
            ProcessBuilder pb;
            if (isWindows()) {
                pb = new ProcessBuilder("cmd.exe", "/c", "npm", "run", "dev", "--", "--port", String.valueOf(FRONTEND_PORT), "--host", "127.0.0.1");
            } else {
                pb = new ProcessBuilder("npm", "run", "dev", "--", "--port", String.valueOf(FRONTEND_PORT), "--host", "127.0.0.1");
            }
            pb.directory(frontendDir);
            pb.redirectErrorStream(true);
            Process p = pb.start();
            launchedProcesses.add(p);
            pipeOutputAsync(p.getInputStream(), "[FRONTEND]");
        } catch (Exception e) {
            System.err.println("[ERROR] Failed to start frontend process: " + e.getMessage());
            System.exit(1);
        }
    }

    private static void pipeOutputAsync(InputStream is, String prefix) {
        Thread t = new Thread(() -> {
            try (BufferedReader r = new BufferedReader(new InputStreamReader(is))) {
                String line;
                while ((line = r.readLine()) != null) {
                    if (isVerbose) {
                        System.out.println(prefix + " " + line);
                        continue;
                    }

                    // Filter noisy framework and compilation progress lines
                    if ("[MAVEN]".equals(prefix)) {
                        if (line.contains("BUILD SUCCESS") || line.contains("BUILD FAILURE") ||
                            line.contains("[ERROR]") || line.contains("Fatal") || line.contains("FAILURE")) {
                            System.out.println(prefix + " " + line);
                        }
                    } else if ("[BACKEND]".equals(prefix)) {
                        if (line.contains("Started UnisApplication") ||
                            line.contains("Flyway") ||
                            line.contains("Successfully applied") ||
                            line.contains("ERROR") || line.contains("WARN") ||
                            line.contains("Exception") ||
                            line.contains("[AUTH]") || line.contains("[GOVERNANCE]") || line.contains("[AUDIT]")) {
                            System.out.println(prefix + " " + line);
                        }
                    } else if ("[FRONTEND]".equals(prefix)) {
                        if (line.contains("VITE") || line.contains("Local:") || line.toLowerCase().contains("error")) {
                            System.out.println(prefix + " " + line);
                        }
                    } else {
                        System.out.println(prefix + " " + line);
                    }
                }
            } catch (Exception ignored) {}
        });
        t.setDaemon(true);
        t.start();
    }

    private static boolean isPortOpen(String host, int port, int timeoutMs) {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(host, port), timeoutMs);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private static boolean isHttpReady(String urlString, int timeoutMs) {
        try {
            URL url = new URI(urlString).toURL();
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(timeoutMs);
            conn.setReadTimeout(timeoutMs);
            int code = conn.getResponseCode();
            if (code >= 200 && code < 500) return true;
        } catch (Exception ignored) {}

        if (urlString.contains("localhost")) {
            try {
                String altUrl = urlString.replace("localhost", "127.0.0.1");
                URL url2 = new URI(altUrl).toURL();
                HttpURLConnection conn2 = (HttpURLConnection) url2.openConnection();
                conn2.setRequestMethod("GET");
                conn2.setConnectTimeout(timeoutMs);
                conn2.setReadTimeout(timeoutMs);
                int code2 = conn2.getResponseCode();
                if (code2 >= 200 && code2 < 500) return true;
            } catch (Exception ignored) {}
        }

        return false;
    }

    private static boolean waitForHttpReady(String urlString, int maxWaitSeconds) {
        for (int i = 0; i < maxWaitSeconds; i++) {
            if (isHttpReady(urlString, 1500)) {
                return true;
            }
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return false;
            }
        }
        return false;
    }

    private static void openBrowser(String url) {
        System.out.println("[BROWSER] Opening Google Chrome to " + url + "...");

        List<String> chromeCandidates = List.of(
            "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
            System.getenv("LOCALAPPDATA") != null ? System.getenv("LOCALAPPDATA") + "\\Google\\Chrome\\Application\\chrome.exe" : ""
        );

        String chosenChrome = null;
        for (String path : chromeCandidates) {
            if (!path.isEmpty() && new File(path).exists()) {
                chosenChrome = path;
                break;
            }
        }

        if (chosenChrome != null) {
            try {
                new ProcessBuilder(chosenChrome, url).start();
                System.out.println("[OK] Google Chrome launched successfully.");
                return;
            } catch (Exception e) {
                System.err.println("[WARN] Could not launch Chrome directly: " + e.getMessage());
            }
        }

        System.out.println("[BROWSER] Falling back to system default web browser...");
        try {
            if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
                Desktop.getDesktop().browse(new URI(url));
            } else if (isWindows()) {
                new ProcessBuilder("cmd.exe", "/c", "start", url).start();
            }
        } catch (Exception e) {
            System.err.println("[WARN] Could not launch default browser automatically: " + e.getMessage());
            System.out.println("[INFO] Please open " + url + " manually in your browser.");
        }
    }

    private static void checkCommandAvailable(String cmd, String hint) {
        try {
            ProcessBuilder pb = isWindows() ? new ProcessBuilder("cmd.exe", "/c", cmd, "--version") : new ProcessBuilder(cmd, "--version");
            Process p = pb.start();
            boolean ok = p.waitFor(5, TimeUnit.SECONDS);
            if (!ok || p.exitValue() != 0) {
                System.err.println("[WARN] Command '" + cmd + "' may not be available: " + hint);
            }
        } catch (Exception e) {
            System.err.println("[WARN] Command '" + cmd + "' check failed: " + hint);
        }
    }

    private static boolean isWindows() {
        return System.getProperty("os.name", "").toLowerCase().contains("win");
    }

    private static void printBanner() {
        System.out.println("""
            ================================================================================
               __  ___   __ _____  _____   Unified Network for Institutional Service
              / / / / | / // ___/ / ___/   Enterprise Service Operations Platform
             / / / /  |/ / \\__ \\  \\__ \\    Java 21 / Spring Boot & React
            / /_/ / /|  / ___/ / ___/ /
            \\____/_/ |_/ /____/ /____/     Starting Services...
            ================================================================================
            """);
    }
}
