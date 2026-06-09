"use client";

import { useActionState } from "react";
import { connectStoreOrEvent } from "./action";
import { Field, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ConnectAuthUser() {
    const[state, formAction, isPending] = useActionState(connectStoreOrEvent, null);
    return (
        <form action={formAction} className="flex gap-4">
            <Field>
                <FieldDescription>認証コードを入力</FieldDescription>
                <Input name="authCode" required disabled={isPending} />
            </Field>
            <Button type="submit" variant="card">紐付ける</Button>
        </form>
    )
}