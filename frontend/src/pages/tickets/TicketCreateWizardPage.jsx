import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Wifi,
  Monitor,
  FlaskConical,
  Zap,
  Droplets,
  Sparkles,
  Armchair,
  ShieldAlert,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Building,
  MapPin,
  Bot,
  Copy,
  ChevronRight,
  Send
} from 'lucide-react';
import client from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const CATEGORY_OPTIONS = [
  { id: 'Wi-Fi and networking', label: 'Wi-Fi & Networking', icon: Wifi, desc: 'Signal drops, router faults, slow campus intranet' },
  { id: 'Classroom technology', label: 'Classroom Tech', icon: Monitor, desc: 'Projectors, smartboards, audio mics, podiums' },
  { id: 'Laboratory equipment', label: 'Lab Equipment', icon: FlaskConical, desc: 'Instruments, test benches, fume hoods, experimental apparatus' },
  { id: 'Electrical and power', label: 'Electrical & Power', icon: Zap, desc: 'Power outages, loose sockets, flickering lights, generator backups' },
  { id: 'Plumbing and water', label: 'Plumbing & Water', icon: Droplets, desc: 'Water cooler leaks, tap damage, restroom blockages' },
  { id: 'Cleanliness and waste', label: 'Cleanliness & Waste', icon: Sparkles, desc: 'Janitorial needs, spillages, overflowing bins' },
  { id: 'Facilities and furniture', label: 'Facilities & Furniture', icon: Armchair, desc: 'Broken chairs, damaged desks, door locks, windows' },
  { id: 'Security or safety concerns', label: 'Campus Safety', icon: ShieldAlert, desc: 'Hazardous obstacles, lighting safety, access security' },
  { id: 'Other', label: 'Other', icon: HelpCircle, desc: 'Miscellaneous campus facility maintenance queries' },
];

export function TicketCreateWizardPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);

  // Form State
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationId, setLocationId] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [floorNumber, setFloorNumber] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [priority, setPriority] = useState('MEDIUM');

  // AI & Similarity Intelligence State
  const [classifying, setClassifying] = useState(false);
  const [classificationResult, setClassificationResult] = useState(null);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [duplicateMatches, setDuplicateMatches] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoadingLocations(true);
      const res = await client.get('/locations');
      setLocations(res.data.data || []);
    } catch (err) {
      console.error('Failed to load locations:', err);
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleLocationSelect = (e) => {
    const locId = e.target.value;
    setLocationId(locId);
    const loc = locations.find((l) => l.id.toString() === locId);
    if (loc) {
      setBuildingName(loc.buildingName);
      setFloorNumber(loc.floorNumber);
      setRoomNumber(loc.roomNumber);
    }
  };

  const runIntelligenceAssistant = async () => {
    if (!title.trim()) return;
    try {
      setClassifying(true);
      setCheckingDuplicates(true);

      const [classRes, dupRes] = await Promise.all([
        client.post('/tickets/classify', {
          title,
          description,
          currentCategory: category,
          buildingName,
        }),
        client.get('/tickets/similar', {
          params: {
            title,
            category,
            building: buildingName,
            room: roomNumber,
          },
        }),
      ]);

      const classData = classRes.data.data;
      setClassificationResult(classData);
      if (classData?.suggestedPriority) {
        setPriority(classData.suggestedPriority);
      }
      if (classData?.suggestedCategory && !category) {
        setCategory(classData.suggestedCategory);
      }

      setDuplicateMatches(dupRes.data.data || []);
    } catch (err) {
      console.error('Intelligence assistant query failed:', err);
    } finally {
      setClassifying(false);
      setCheckingDuplicates(false);
    }
  };

  const handleNextToStep3 = async () => {
    if (!title.trim() || !description.trim() || !buildingName.trim() || !roomNumber.trim()) {
      setError('Please provide a title, description, and campus location details.');
      return;
    }
    setError('');
    setStep(3);
    await runIntelligenceAssistant();
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');
      const payload = {
        title,
        description,
        category: classificationResult?.suggestedCategory || category || 'Other',
        priority: priority || 'MEDIUM',
        locationId: locationId ? parseInt(locationId) : null,
        buildingName,
        floorNumber,
        roomNumber,
      };

      const res = await client.post('/tickets', payload);
      const createdTicket = res.data.data;
      navigate(`/tickets/${createdTicket.id}`);
    } catch (err) {
      console.error('Failed to submit ticket:', err);
      setError(err.response?.data?.message || 'Could not submit ticket. Please verify details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wizard Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-unis-ink dark:text-unis-dark-text tracking-tight">
          Report Campus Maintenance Issue
        </h1>
        <p className="text-sm text-unis-slate dark:text-unis-dark-muted">
          Follow the 4-step guided triage to route your problem to the appropriate campus maintenance crew.
        </p>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { num: 1, label: 'Category' },
          { num: 2, label: 'Details' },
          { num: 3, label: 'AI Review' },
          { num: 4, label: 'Confirm' },
        ].map((s) => (
          <div
            key={s.num}
            className={`p-3 rounded-xl border text-center transition-all ${
              step === s.num
                ? 'bg-gradient-to-r from-unis-brand to-unis-indigo text-white border-transparent shadow-subtle font-bold'
                : step > s.num
                ? 'bg-unis-blue-light dark:bg-unis-dark-elevated text-unis-brand dark:text-unis-dark-brand border-unis-border font-medium'
                : 'bg-unis-card dark:bg-unis-dark-card text-unis-slate border-unis-border opacity-70'
            }`}
          >
            <div className="text-xs leading-none">Step {s.num}</div>
            <div className="text-[11px] mt-0.5 truncate">{s.label}</div>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-2 border border-rose-200">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: CATEGORY SELECTION */}
      {step === 1 && (
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-unis-ink dark:text-unis-dark-text">
              1. Select Problem Classification
            </h2>
            <p className="text-xs text-unis-slate dark:text-unis-dark-muted">
              Choose the general service category that describes the breakdown or request.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {CATEGORY_OPTIONS.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-unis-brand bg-unis-blue-light/60 dark:bg-unis-dark-elevated ring-2 ring-unis-brand shadow-subtle'
                      : 'border-unis-border dark:border-unis-dark-border hover:border-unis-brand/50 bg-unis-card dark:bg-unis-dark-card'
                  }`}
                >
                  <div className="space-y-2">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isSelected
                          ? 'bg-gradient-to-br from-unis-brand to-unis-indigo text-white shadow-xs'
                          : 'bg-stone-100 dark:bg-unis-dark-elevated text-unis-brand dark:text-unis-dark-brand'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-unis-ink dark:text-unis-dark-text">
                      {cat.label}
                    </h3>
                    <p className="text-[11px] text-unis-slate dark:text-unis-dark-muted leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4 border-t border-unis-border dark:border-unis-dark-border">
            <Button
              variant="primary"
              disabled={!category}
              onClick={() => {
                setError('');
                setStep(2);
              }}
            >
              Continue to Details
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: DETAILS & CAMPUS LOCATION */}
      {step === 2 && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-unis-ink dark:text-unis-dark-text">
                2. Problem Description & Location
              </h2>
              <p className="text-xs text-unis-slate dark:text-unis-dark-muted">
                Specify exactly where the fault occurred so maintenance crews can locate it quickly.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-unis-blue-light dark:bg-unis-dark-elevated text-unis-brand dark:text-unis-dark-brand">
              {category}
            </span>
          </div>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-unis-slate dark:text-unis-dark-muted mb-1">
                Summary Headline *
              </label>
              <input
                type="text"
                placeholder="e.g. Broken overhead projector in Computing Lab 2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:outline-none focus:ring-2 focus:ring-unis-brand"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-unis-slate dark:text-unis-dark-muted mb-1">
                Detailed Observation & Symptoms *
              </label>
              <textarea
                rows={4}
                placeholder="Describe what happened, any error messages or visible damage, and how long the problem has persisted..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:outline-none focus:ring-2 focus:ring-unis-brand"
              />
            </div>

            {/* Location dropdown */}
            <div className="p-4 rounded-xl bg-stone-50 dark:bg-unis-dark-elevated space-y-3 border border-unis-border dark:border-unis-dark-border">
              <div className="flex items-center gap-2 text-xs font-bold text-unis-brand dark:text-unis-dark-brand">
                <Building className="w-4 h-4" />
                Select Standard Campus Location (Optional shortcut)
              </div>
              <select
                value={locationId}
                onChange={handleLocationSelect}
                className="w-full px-3 py-2 text-sm rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:outline-none focus:ring-2 focus:ring-unis-brand"
              >
                <option value="">-- Choose canonical location or type below --</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.buildingName} - {loc.roomNumber} ({loc.locationType})
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-unis-slate dark:text-unis-dark-muted mb-1">
                    Building *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Main Academic Block"
                    value={buildingName}
                    onChange={(e) => setBuildingName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:ring-2 focus:ring-unis-brand"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-unis-slate dark:text-unis-dark-muted mb-1">
                    Floor
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2nd Floor"
                    value={floorNumber}
                    onChange={(e) => setFloorNumber(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:ring-2 focus:ring-unis-brand"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-unis-slate dark:text-unis-dark-muted mb-1">
                    Room / Lab Number *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lab 2"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card focus:ring-2 focus:ring-unis-brand"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-unis-border dark:border-unis-dark-border">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button variant="primary" onClick={handleNextToStep3}>
              Run AI Assistant & Check Duplicates
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: EXPLAINABLE AI ASSISTANT & DUPLICATE CHECK */}
      {step === 3 && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-unis-brand to-unis-indigo text-white shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-unis-ink dark:text-unis-dark-text">
                3. Intelligent Triage & Duplicate Detection
              </h2>
              <p className="text-xs text-unis-slate dark:text-unis-dark-muted">
                Rule-based algorithmic validation of classification, priority SLA target, and existing unresolved tickets.
              </p>
            </div>
          </div>

          {classifying || checkingDuplicates ? (
            <div className="py-8 flex justify-center">
              <LoadingSpinner size="md" message="Analyzing keywords and comparing open campus tickets..." />
            </div>
          ) : (
            <div className="space-y-5">
              {/* Duplicate Complaints Warning */}
              {duplicateMatches.length > 0 && (
                <div className="p-4.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 space-y-3">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                    <Copy className="w-4 h-4" />
                    Possible Duplicate Complaint Found ({duplicateMatches.length})
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    Another campus member recently reported a very similar incident in this location. You can choose to follow that existing ticket for resolution updates instead of creating a duplicate report.
                  </p>
                  <div className="space-y-2 pt-1">
                    {duplicateMatches.map((d) => (
                      <div
                        key={d.id}
                        className="p-3 bg-white dark:bg-unis-dark-card rounded-xl border border-amber-200 dark:border-amber-900/60 flex items-center justify-between"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-bold text-unis-brand">
                              {d.ticketReference}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                              {d.similarityScore}% Match
                            </span>
                          </div>
                          <div className="text-xs font-bold text-unis-ink dark:text-unis-dark-text">
                            {d.title}
                          </div>
                          <div className="text-[10px] text-unis-slate">
                            Status: <strong>{d.status}</strong> • {d.roomNumber} • Match reason: {d.matchReason}
                          </div>
                        </div>
                        <Link to={`/tickets/${d.id}`} target="_blank">
                          <Button size="sm" variant="outline" className="text-xs border-amber-300">
                            Inspect Ticket
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Explainable AI Classification Card */}
              {classificationResult && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-unis-blue-light/50 to-unis-violet-light/40 dark:bg-unis-dark-elevated border border-unis-brand/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-unis-brand dark:text-unis-dark-brand flex items-center gap-1.5">
                      <Bot className="w-4 h-4" />
                      Rule Engine Recommendations
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-unis-brand to-unis-indigo text-white shadow-xs">
                      Confidence: {classificationResult.confidenceScore}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-3 bg-white dark:bg-unis-dark-card rounded-xl border border-unis-border">
                      <div className="text-[10px] font-bold text-unis-slate uppercase">Recommended Category</div>
                      <div className="text-xs font-extrabold text-unis-brand mt-0.5">
                        {classificationResult.suggestedCategory}
                      </div>
                    </div>
                    <div className="p-3 bg-white dark:bg-unis-dark-card rounded-xl border border-unis-border">
                      <div className="text-[10px] font-bold text-unis-slate uppercase">Assigned Department</div>
                      <div className="text-xs font-extrabold text-unis-indigo mt-0.5">
                        {classificationResult.suggestedDepartmentName}
                      </div>
                    </div>
                    <div className="p-3 bg-white dark:bg-unis-dark-card rounded-xl border border-unis-border">
                      <div className="text-[10px] font-bold text-unis-slate uppercase">Suggested Priority</div>
                      <div className="text-xs font-extrabold text-unis-brand mt-0.5">
                        {classificationResult.suggestedPriority}
                      </div>
                    </div>
                  </div>

                  {/* Explainability trace */}
                  <div className="text-xs text-unis-slate dark:text-unis-dark-muted bg-white/70 dark:bg-unis-dark-card/70 p-3 rounded-xl border border-unis-border/70 space-y-1">
                    <div className="font-bold text-[11px] text-unis-ink dark:text-unis-dark-text">
                      Explainable Reasoning:
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      {classificationResult.explanation}
                    </p>
                    {classificationResult.matchedKeywords?.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        <span className="text-[10px] font-semibold text-unis-slate">Keywords matched:</span>
                        {classificationResult.matchedKeywords.map((kw, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-unis-brand/10 text-unis-brand font-bold"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-unis-border dark:border-unis-dark-border">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setError('');
                setStep(4);
              }}
            >
              Review & Finalize
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 4: FINAL SUMMARY REVIEW */}
      {step === 4 && (
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-unis-ink dark:text-unis-dark-text">
              4. Review & Confirm Submission
            </h2>
            <p className="text-xs text-unis-slate dark:text-unis-dark-muted">
              Verify your report parameters before generating a persistent institutional helpdesk ticket.
            </p>
          </div>

          <div className="space-y-4 p-5 rounded-2xl bg-stone-50 dark:bg-unis-dark-elevated border border-unis-border dark:border-unis-dark-border">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-unis-slate text-[11px]">Category:</span>
                <p className="font-bold text-unis-ink dark:text-unis-dark-text">{category}</p>
              </div>
              <div>
                <span className="text-unis-slate text-[11px]">Target Department:</span>
                <p className="font-bold text-unis-brand">
                  {classificationResult?.suggestedDepartmentName || 'Operations Triage'}
                </p>
              </div>
              <div>
                <span className="text-unis-slate text-[11px]">Priority:</span>
                <p className="font-bold text-unis-ink dark:text-unis-dark-text">{priority}</p>
              </div>
              <div>
                <span className="text-unis-slate text-[11px]">Location:</span>
                <p className="font-bold text-unis-ink dark:text-unis-dark-text">
                  {buildingName} ({roomNumber})
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-unis-border dark:border-unis-dark-border space-y-1">
              <span className="text-unis-slate text-[11px]">Headline:</span>
              <p className="text-sm font-bold text-unis-ink dark:text-unis-dark-text">{title}</p>
            </div>

            <div className="space-y-1">
              <span className="text-unis-slate text-[11px]">Problem Details:</span>
              <p className="text-xs text-unis-slate dark:text-unis-dark-muted leading-relaxed whitespace-pre-wrap">
                {description}
              </p>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-unis-border dark:border-unis-dark-border">
            <Button variant="outline" onClick={() => setStep(3)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button variant="primary" loading={submitting} onClick={handleSubmit}>
              <Send className="w-4 h-4 mr-2" />
              Submit Service Ticket
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
