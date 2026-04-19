"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type OrganizationOption = { id: string; name: string };

interface OrganizationSelectLinkProps {
  organizations: OrganizationOption[];
  href: string;
  context: string;
}

export default function OrganizationSelectLink({
  organizations,
  href,
  context,
}: OrganizationSelectLinkProps) {
  const [selectedOrganizationId, setSelectedOrganizationId] =
    useState<string>("");

  return (
    <div className="flex gap-4 items-center">
      <Select onValueChange={setSelectedOrganizationId}>
        <SelectTrigger>
          <SelectValue placeholder="組織を選択" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {organizations.map((organization) => (
              <SelectItem key={organization.id} value={organization.id}>
                {organization.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {selectedOrganizationId ? (
        <Button asChild variant="card">
          <Link href={`${href}/${selectedOrganizationId}`}>{context}</Link>
        </Button>
      ) : (
        <p>組織を選択してください</p>
      )}
    </div>
  );
}
