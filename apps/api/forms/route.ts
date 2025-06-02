import { NextResponse } from "next/server";
import { prisma } from "../lib/prisma";
import {
  FormConfig as SharedFormConfig,
  UserDefinedField,
} from "@formulate/shared-types";
import { z } from "zod";
import { FormField } from "@prisma/client";

const createFormSchema = z.object({
  title: z.string().min(1, "Title cannot be empty."),
  description: z.string().optional(),
  fields: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, "Field name cannot be empty."),
      type: z.enum(["text", "number", "checkbox", "date", "select"]),
      options: z.array(z.string().optional()),
      required: z.boolean().optional(),
    })
  ),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = createFormSchema.parse(body);

    const newForm = await prisma.formConfig.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        fields: {
          create: validatedData.fields.map((field) => ({
            name: field.name,
            type: field.type,
            // options: field.options ? JSON.stringify(field.options) : null,
            options: JSON.stringify(field.options),
            required: field.required || false,
          })),
        },
      },
      include: {
        fields: true,
      },
    });

    const responseForm: SharedFormConfig = {
      formId: newForm.id,
      title: newForm.title,
      description: newForm.description || undefined,
      fields: newForm.fields.map((field: FormField) => ({
        id: field.id,
        name: field.name,
        type: field.type as UserDefinedField["type"],
        options: field.options
          ? (field.options as string[] | undefined)
          : undefined,
        required: field.required,
      })),
    };

    return NextResponse.json(responseForm, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: error.errors,
        },
        { status: 400 }
      );
    }
    console.error("Error creating form:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
