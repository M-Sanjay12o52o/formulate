"use client";

import React, { useState } from "react";
import { UserDefinedField } from "@formulate/shared-types";
import { z, ZodError } from "zod";

const clientFieldSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Field name cannot be empty."),
  type: z.enum(["text", "number", "checkbox", "date", "select"]),
  options: z.array(z.string()).optional(),
  required: z.boolean().optional(),
});

const clientCreateFormSchema = z.object({
  title: z.string().min(1, "Form title cannot be empty."),
  description: z.string().optional(),
  fields: z.array(clientFieldSchema),
});

export default function FormBuilderPage() {
  const [formTitle, setFormTitle] = useState<string>("");
  const [formDescription, setFormDescription] = useState<string>("");

  const [formFields, setFormFields] = useState<UserDefinedField[]>([]);

  const [validationErrors, setValidationErrors] = useState<ZodError | null>(
    null
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const generateTempId = () =>
    `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const handleAddField = () => {
    setFormFields((prevFields) => [
      ...prevFields,
      {
        id: generateTempId(),
        name: "",
        type: "text",
        required: false,
        options: undefined,
      } as UserDefinedField,
    ]);
  };

  const handleRemoveField = (idToRemove: string) => {
    setFormFields((prevFields) =>
      prevFields.filter((field) => field.id !== idToRemove)
    );
  };

  const handleFieldChange = (
    idToUpdate: string,
    key: keyof UserDefinedField,
    value: string | boolean | string[] | undefined
  ) => {
    setFormFields((prevFields) =>
      prevFields.map((field) =>
        field.id === idToUpdate
          ? {
              ...field,
              [key]: value,
              options:
                key === "type" && value !== "select"
                  ? undefined
                  : key === "type" &&
                      value === "select" &&
                      field.options === undefined
                    ? []
                    : field.options,
            }
          : field
      )
    );
  };

  const handleFieldOptionsChange = (
    idToUpdate: string,
    optionsString: string
  ) => {
    const optionsArray = optionsString
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    handleFieldChange(
      idToUpdate,
      "options",
      optionsArray.length > 0 ? optionsArray : undefined
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setValidationErrors(null);
    setSuccessMessage(null);
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const dataToSubmit = {
        title: formTitle,
        description: formDescription,
        fields: formFields.map(({ id, ...rest }) => rest),
      };

      clientCreateFormSchema.parse(dataToSubmit);

      const response = await fetch("/api/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 400 && result.errors) {
          console.error("Backend Validation Error:", result.errors);
          setErrorMessage("Form validation failed. Please check your inputs.");
        } else {
          setErrorMessage(result.message || "An unexpected error occurred.");
        }
        return;
      }

      setSuccessMessage("Form created successfully!");
      setFormTitle("");
      setFormDescription("");
      setFormFields([]);
    } catch (error) {
      if (error instanceof ZodError) {
        setValidationErrors(error);
        setErrorMessage("Please correct the highlighted errors in the form.");
        console.error("Client-side validation errors:", error.errors);
      } else {
        setErrorMessage(
          "An unexpected error occurred: " + (error as Error).message
        );
        console.error("Submission error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "auto",
        padding: "20px",
        fontFamily: "sans-serif",
      }}
    >
      <h1>Create New Form</h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "20px" }}
      >
        <div
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            borderRadius: "8px",
          }}
        >
          <h2>Form Details</h2>
          <label
            htmlFor="formTitle"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Title:
          </label>
          <input
            type="text"
            id="formTitle"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
          {validationErrors?.formErrors.fieldErrors.title && (
            <p style={{ color: "red", fontSize: "0.8em" }}>
              {validationErrors.formErrors.fieldErrors.title[0]}
            </p>
          )}

          <label
            htmlFor="formDescription"
            style={{ display: "block", marginTop: "15px", marginBottom: "5px" }}
          >
            Description (Optional):
          </label>
          <textarea
            id="formDescription"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            rows={4}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          ></textarea>
        </div>

        <div
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            borderRadius: "8px",
          }}
        >
          <h2>Form Fields</h2>
          {formFields.length === 0 && (
            <p>No fields added yet. Click `Add Field` to begin!</p>
          )}
          {formFields.map((field, index) => (
            <div
              key={field.id}
              style={{
                border: "1px solid #eee",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "4px",
              }}
            >
              <h3 style={{ marginTop: "0" }}>Field #{index + 1}</h3>
              <label
                htmlFor={`fieldName-${field.id}`}
                style={{ display: "block", marginBottom: "5px" }}
              >
                Name:
              </label>
              <input
                type="text"
                id={`fieldName-${field.id}`}
                value={field.name}
                onChange={(e) =>
                  handleFieldChange(field.id, "name", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
              {validationErrors?.formErrors.fieldErrors[
                `fields.${index}.name`
              ] && (
                <p style={{ color: "red", fontSize: "0.8em" }}>
                  {
                    validationErrors.formErrors.fieldErrors[
                      `fields.${index}.name`
                    ]?.[0]
                  }
                </p>
              )}

              <label
                htmlFor={`fieldType-${field.id}`}
                style={{
                  display: "block",
                  marginTop: "10px",
                  marginBottom: "5px",
                }}
              >
                Type:
              </label>
              <select
                id={`fieldType-${field.id}`}
                value={field.type}
                onChange={(e) =>
                  handleFieldChange(
                    field.id,
                    "type",
                    e.target.value as UserDefinedField["type"]
                  )
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="checkbox">Checkbox</option>
                <option value="date">Date</option>
                <option value="select">Select</option>
              </select>

              {field.type === "select" && (
                <div style={{ marginTop: "10px" }}>
                  <label
                    htmlFor={`fieldOptions-${field.id}`}
                    style={{ display: "block", marginBottom: "5px" }}
                  >
                    Options (comma-separated):
                  </label>
                  <textarea
                    id={`fieldOptions-${field.id}`}
                    value={field.options?.join(", ") || ""}
                    onChange={(e) =>
                      handleFieldOptionsChange(field.id, e.target.value)
                    }
                    rows={2}
                    placeholder="e.g., Option A, Option B, Option C"
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                    }}
                  ></textarea>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: "10px",
                }}
              >
                <input
                  type="checkbox"
                  id={`fieldRequired-${field.id}`}
                  checked={field.required || false}
                  onChange={(e) =>
                    handleFieldChange(field.id, "required", e.target.checked)
                  }
                  style={{ marginRight: "5px" }}
                />
                <label htmlFor={`fieldRequired-${field.id}`}>Required</label>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveField(field.id!)}
                style={{
                  marginTop: "15px",
                  padding: "8px 15px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Remove Field
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddField}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Add Field
          </button>
        </div>

        {/* Submission Feedback */}
        {isLoading && <p style={{ color: "blue" }}>Saving form...</p>}
        {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: "12px 25px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "1.1em",
          }}
        >
          {isLoading ? "Saving..." : "Save Form"}
        </button>
      </form>
    </div>
  );
}
