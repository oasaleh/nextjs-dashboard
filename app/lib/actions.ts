"use server";

import { z } from "zod";
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const formSchema = z.object({
  id: z.string().optional(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(["paid", "pending"]),
  date: z.string().optional(),
});

export async function createInvoice(formData: FormData) {
  // 2-step validation:
  // const rawFormData = {
  //   customerId: formData.get("customerId"),
  //   amount: formData.get("amount"),
  //   status: formData.get("status"),
  // };

  // const validatedFormData = formSchema.parse(rawFormData);

  // 1-step validation:
  const { customerId, amount, status } = formSchema.parse(
    Object.fromEntries(formData)
  );

  // Change the amount to cents.
  const amountInCents = amount * 100;

  // Create the date.
  const date = new Date().toISOString().split("T")[0];

  await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}
