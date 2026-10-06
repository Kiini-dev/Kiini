import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RichTextEditor } from "@/components/RichTextEditor";
import { PhoneInput } from "@/components/PhoneInput";
import { CountrySelect, CitySelect, IndustrySelect } from "@/components/LocationSelects";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";

export type ClientFormData = {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  secondaryPhone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  taxId: string;
  website: string;
  industry: string;
  category?: string;
  businessType: string;
  registrationNumber: string;
  yearEstablished: string;
  numberOfEmployees: string;
  businessLicense: string;
  paymentTerms: string;
  creditLimit: string;
  bankName: string;
  bankCode: string;
  branch: string;
  bankAccountNumber: string;
  currency: string;
  leadSource: string;
  status: "active" | "inactive" | "prospect" | "archived";
  assignedTo: string;
  notes: string;
  createClientLogin?: boolean;
  clientPassword?: string;
};

const PAYMENT_TERMS = [
  "Due on Receipt",
  "Net 7",
  "Net 14",
  "Net 30",
  "Net 45",
  "Net 60",
  "Net 90",
];

const LEAD_SOURCES = [
  { value: "referral", label: "Referral" },
  { value: "website", label: "Website" },
  { value: "social_media", label: "Social Media" },
  { value: "cold_call", label: "Cold Call" },
  { value: "trade_show", label: "Trade Show" },
  { value: "advertisement", label: "Advertisement" },
  { value: "tender", label: "Tender" },
  { value: "existing_client", label: "Existing Client" },
  { value: "other", label: "Other" },
];

const CURRENCY_OPTIONS = [
  { value: "KES", label: "KES - Kenya Shilling" },
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "TZS", label: "TZS - Tanzania Shilling" },
  { value: "UGX", label: "UGX - Uganda Shilling" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "prospect", label: "Prospect" },
  { value: "inactive", label: "Inactive" },
  { value: "archived", label: "Archived" },
];

interface TeamMember {
  id: string;
  name?: string;
  email?: string;
}

interface ClientFormProps {
  formData: ClientFormData;
  setFormData: React.Dispatch<React.SetStateAction<ClientFormData>>;
  teamMembers?: TeamMember[];
  showPortalLogin?: boolean;
  showCreateClientLogin?: boolean;
}

export function ClientForm({
  formData,
  setFormData,
  teamMembers = [],
  showPortalLogin = false,
  showCreateClientLogin = false,
}: ClientFormProps) {
  const { data: categorySettings } = trpc.settings.getByCategory.useQuery({ category: "clients_categories" }, { staleTime: 60_000 });
  const { data: leadSourceSettings } = trpc.settings.getByCategory.useQuery({ category: "lead_sources" }, { staleTime: 60_000 });
  const clientCategories = (() => {
    try {
      const parsed = JSON.parse(categorySettings?.list || "null");
      return Array.isArray(parsed)
        ? parsed.filter((category): category is { id: string; name: string } => Boolean(category?.id && category?.name))
        : [];
    } catch {
      return [];
    }
  })();
  const leadSources = (() => {
    try {
      const parsed = JSON.parse(leadSourceSettings?.list || "null");
      const configured = Array.isArray(parsed)
        ? parsed
          .map((source) => typeof source === "string" ? { value: source, label: source } : source?.name ? { value: source.name, label: source.name } : null)
          .filter(Boolean) as { value: string; label: string }[]
        : [];
      return configured.length > 0 ? configured : LEAD_SOURCES;
    } catch {
      return LEAD_SOURCES;
    }
  })();
  const uniqueTeamMembers = Array.from(
    new Map(teamMembers.filter((member) => member.id).map((member) => [member.id, member])).values(),
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            placeholder="Acme Corporation"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactPerson">Contact Person</Label>
          <Input
            id="contactPerson"
            value={formData.contactPerson}
            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
            placeholder="John Doe"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="info@company.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <PhoneInput
            id="phone"
            value={formData.phone}
            onChange={(value) => setFormData({ ...formData, phone: value })}
            placeholder="0700 000 000"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="secondaryPhone">Secondary Phone</Label>
          <PhoneInput
            id="secondaryPhone"
            value={formData.secondaryPhone}
            onChange={(value) => setFormData({ ...formData, secondaryPhone: value })}
            placeholder="0711 000 000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://www.company.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="123 Business Ave, Suite 100"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City / Town</Label>
          <CitySelect
            value={formData.city}
            onChange={(value) => setFormData({ ...formData, city: value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <CountrySelect
            value={formData.country}
            onChange={(value) => setFormData({ ...formData, country: value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postalCode">Postal / ZIP Code</Label>
          <Input
            id="postalCode"
            value={formData.postalCode}
            onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
            placeholder="00100"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="taxId">Tax ID / KRA PIN</Label>
          <Input
            id="taxId"
            value={formData.taxId}
            onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
            placeholder="A123456789X"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <IndustrySelect
            value={formData.industry}
            onChange={(value) => setFormData({ ...formData, industry: value })}
          />
        </div>
        {clientCategories.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="category">Client Category</Label>
            <Select
              value={formData.category || ""}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select client category" />
              </SelectTrigger>
              <SelectContent>
                {clientCategories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="businessType">Business Type</Label>
          <Input
            id="businessType"
            value={formData.businessType}
            onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
            placeholder="e.g. Limited Company"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="registrationNumber">Registration Number</Label>
          <Input
            id="registrationNumber"
            value={formData.registrationNumber}
            onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
            placeholder="PVT-12345678"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="yearEstablished">Year Established</Label>
          <Input
            id="yearEstablished"
            type="number"
            min="1900"
            max={new Date().getFullYear()}
            value={formData.yearEstablished}
            onChange={(e) => setFormData({ ...formData, yearEstablished: e.target.value })}
            placeholder="2010"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="numberOfEmployees">Number of Employees</Label>
          <Input
            id="numberOfEmployees"
            value={formData.numberOfEmployees}
            onChange={(e) => setFormData({ ...formData, numberOfEmployees: e.target.value })}
            placeholder="e.g. 50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="businessLicense">Business License / Permit Number</Label>
          <Input
            id="businessLicense"
            value={formData.businessLicense}
            onChange={(e) => setFormData({ ...formData, businessLicense: e.target.value })}
            placeholder="BL-2024-XXXX"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentTerms">Default Payment Terms</Label>
        <Select
          value={formData.paymentTerms}
          onValueChange={(value) => setFormData({ ...formData, paymentTerms: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select payment terms" />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_TERMS.map((term) => (
              <SelectItem key={term} value={term}>{term}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="creditLimit">Credit Limit</Label>
          <Input
            id="creditLimit"
            type="number"
            value={formData.creditLimit}
            onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
            placeholder="100000"
            min="0"
            step="0.01"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select
            value={formData.currency}
            onValueChange={(value) => setFormData({ ...formData, currency: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCY_OPTIONS.map((currency) => (
                <SelectItem key={currency.value} value={currency.value}>{currency.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bankName">Bank Name</Label>
          <Input
            id="bankName"
            value={formData.bankName}
            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
            placeholder="Equity Bank"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bankCode">Bank Code</Label>
          <Input
            id="bankCode"
            value={formData.bankCode}
            onChange={(e) => setFormData({ ...formData, bankCode: e.target.value })}
            placeholder="068"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="branch">Branch</Label>
          <Input
            id="branch"
            value={formData.branch}
            onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
            placeholder="Westlands Branch"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bankAccountNumber">Bank Account Number</Label>
          <Input
            id="bankAccountNumber"
            value={formData.bankAccountNumber}
            onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
            placeholder="0123456789"
          />
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value as ClientFormData["status"] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="leadSource">Lead Source</Label>
          <Select
            value={formData.leadSource}
            onValueChange={(value) => setFormData({ ...formData, leadSource: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select lead source" />
            </SelectTrigger>
            <SelectContent>
              {leadSources.map((source) => (
                <SelectItem key={source.value} value={source.value}>{source.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="assignedTo">Assigned To (Account Manager)</Label>
          <Select
            value={formData.assignedTo || "__unassigned__"}
            onValueChange={(value) => setFormData({ ...formData, assignedTo: value === "__unassigned__" ? "" : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select team member" />
            </SelectTrigger>
            <SelectContent className="max-h-56 overflow-y-auto">
              <SelectItem value="__unassigned__">— Unassigned —</SelectItem>
              {uniqueTeamMembers.map((member) => (
                <SelectItem key={member.id} value={member.id}>{member.name || member.email || member.id}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <RichTextEditor
          value={formData.notes}
          onChange={(value) => setFormData({ ...formData, notes: value })}
          placeholder="Additional notes about this client"
          minHeight="120px"
        />
      </div>

      {showCreateClientLogin && (
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-start gap-3">
            <Checkbox
              id="createClientLogin"
              checked={!!formData.createClientLogin}
              onCheckedChange={(checked) => setFormData({ ...formData, createClientLogin: !!checked })}
            />
            <div>
              <Label htmlFor="createClientLogin" className="cursor-pointer">
                Create client portal login for this client
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Create a portal account so the client can log in and view invoices, projects, and documents.
              </p>
            </div>
          </div>
          {formData.createClientLogin && (
            <div className="space-y-2 pl-10">
              <Label htmlFor="clientPassword">Portal Password</Label>
              <Input
                id="clientPassword"
                type="password"
                value={formData.clientPassword || ""}
                onChange={(e) => setFormData({ ...formData, clientPassword: e.target.value })}
                placeholder="Leave blank to auto-generate"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
