"use client";

import { useActionState } from "react";
import { connectStoreOrEvent } from "./action";
import { Field, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessagePrompt } from "@/components/prompt/message-prompt";
import { ErrorPrompt } from "@/components/prompt/error-prompt";
import Link from "next/link";

export default function ConnectAuthUser() {
    const[state, formAction, isPending] = useActionState(connectStoreOrEvent, null);
    return (
        <div>
        <form action={formAction} className="flex gap-4 items-baseline">
            <Field>
                <FieldDescription>認証コードを入力</FieldDescription>
                <Input name="authCode" required disabled={isPending} />
            </Field>
            <Button type="submit" variant="card">紐付ける</Button>
        </form>
        {state?.success && state?.message (
            <div className="flex flex-col gap-4">
                <MessagePrompt message={state?.message}/>
                <Button asChild variant="card"><Link href="/dashboard">管理画面</Link></Button>
            </div>
        )}
        {!state?.success && state.message (
            <ErrorPrompt error={state?.message} />
         )}
        </div>
    )
}