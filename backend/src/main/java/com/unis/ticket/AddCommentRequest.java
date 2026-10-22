package com.unis.ticket;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;

public class AddCommentRequest {

    @NotBlank(message = "Comment text is required")
    @JsonAlias({"comment", "commentText", "message"})
    private String commentText;

    @JsonAlias({"internal", "internalOnly"})
    private boolean internal = false;

    public AddCommentRequest() {
    }

    public String getCommentText() {
        return commentText;
    }

    public void setCommentText(String commentText) {
        this.commentText = commentText;
    }

    // Alias for 'comment'
    public void setComment(String comment) {
        if (this.commentText == null || this.commentText.isBlank()) {
            this.commentText = comment;
        }
    }

    public boolean isInternal() {
        return internal;
    }

    public void setInternal(boolean internal) {
        this.internal = internal;
    }

    // Alias for 'internalOnly'
    public void setInternalOnly(boolean internalOnly) {
        this.internal = internalOnly;
    }
}
