import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PhoneInput } from "@/components/PhoneInput";
import { FormField, FormTextInput, FormTextarea, FormSelect } from "@/components/FormField";
import { CountrySelect, CitySelect, IndustrySelect } from "@/components/LocationSelects";
import { trpc } from "@/lib/trpc";
import { BankNameSelect } from "@/components/BankNameSelect";

export interface SupplierFormData {
  companyName: string;
  contactPerson: string;
  contactTitle: string;
  email: string;
  phone: string;
  alternatePhone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  industry: string;
  taxId: string;
  registrationNumber: string;
  website: string;
  bankName: string;
  bankBranch: string;
  accountNumber: string;
  accountName: string;
  paymentTerms: string;
  paymentMethods: string[];
  categories: string[];
  certifications: string[];
  qualificationStatus: "pending" | "pre_qualified" | "qualified" | "rejected" | "inactive";
  qualificationDate: string;
  accountManagerId: string;
  notes: string;
}

interface SupplierFormProps {
  formData: SupplierFormData;
  setFormData: (data: SupplierFormData | ((prev: SupplierFormData) => SupplierFormData)) => void;
  teamMembers: Array<{ id: string; name?: string; email: string }>;
  errors?: Record<string, string>;
}

export function SupplierForm({ formData, setFormData, teamMembers, errors = {} }: SupplierFormProps) {
  const handleInputChange = (field: keyof SupplierFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const PAYMENT_METHODS = ["bank_transfer", "cheque", "mpesa", "cash", "credit_card", "letter_of_credit"];
  const SUPPLY_CATEGORIES = ["office_supplies", "it_equipment", "furniture", "stationery", "cleaning", "security", "catering", "transport", "construction", "electrical", "plumbing", "consulting", "legal", "marketing", "printing"];
  const CERTIFICATIONS = ["ISO_9001", "ISO_14001", "ISO_45001", "AGPO", "NCA", "KEBS", "NEMA", "tax_compliant"];
  const { data: bankSettings = {} } = trpc.settings.getByCategory.useQuery({ category: "payment_bank" });
  const { data: purchasingSettings = {} } = trpc.settings.getByCategory.useQuery({ category: "purchasing_settings" });
  const bankNames = Array.from(new Set(["KCB", "Equity Bank", "Co-operative Bank", "Absa Bank", "NCBA", "Stanbic Bank", "Standard Chartered", "I&M Bank", "Family Bank", bankSettings.bankName].filter(Boolean)));
  const paymentTerms = Array.from(new Set(["Due on receipt", "Net 7", "Net 14", "Net 30", "Net 45", "Net 60", purchasingSettings.defaultPaymentTerms].filter(Boolean)));

  return (
    <>
      {/* Basic Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Company Name" required error={errors.companyName}>
            <FormTextInput
              placeholder="Enter company name"
              value={formData.companyName}
              onChange={(e) => handleInputChange("companyName", e.target.value)}
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Contact Person" error={errors.contactPerson}>
              <FormTextInput
                placeholder="Full name"
                value={formData.contactPerson}
                onChange={(e) => handleInputChange("contactPerson", e.target.value)}
              />
            </FormField>

            <FormField label="Contact Title" error={errors.contactTitle}>
              <FormSelect
                value={formData.contactTitle}
                onValueChange={(value) => handleInputChange("contactTitle", value)}
              >
                <option value="">Select title...</option>
                <option value="Mr">Mr</option>
                <option value="Mrs">Mrs</option>
                <option value="Ms">Ms</option>
                <option value="Dr">Dr</option>
                <option value="Eng">Eng</option>
                <option value="Prof">Prof</option>
              </FormSelect>
            </FormField>
          </div>

          <FormField label="Website" error={errors.website}>
            <FormTextInput
              placeholder="https://example.com"
              value={formData.website}
              onChange={(e) => handleInputChange("website", e.target.value)}
            />
          </FormField>

          <FormField label="Address" error={errors.address}>
            <FormTextarea
              placeholder="Street address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="City" error={errors.city}>
              <CitySelect value={formData.city} onChange={(v) => handleInputChange("city", v)} />
            </FormField>

            <FormField label="Country" error={errors.country}>
              <CountrySelect value={formData.country} onChange={(v) => handleInputChange("country", v)} />
            </FormField>

            <FormField label="Industry" error={errors.industry}>
              <IndustrySelect value={formData.industry} onChange={(v) => handleInputChange("industry", v)} />
            </FormField>

            <FormField label="Postal Code" error={errors.postalCode}>
              <FormTextInput
                placeholder="Postal code"
                value={formData.postalCode}
                onChange={(e) => handleInputChange("postalCode", e.target.value)}
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Email" error={errors.email}>
              <FormTextInput
                type="email"
                placeholder="supplier@company.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </FormField>

            <FormField label="Phone" error={errors.phone}>
              <PhoneInput
                id="supplier-phone"
                value={formData.phone}
                onChange={(value) => handleInputChange("phone", value)}
                placeholder="Enter phone number"
              />
            </FormField>
          </div>

          <FormField label="Alternate Phone" error={errors.alternatePhone}>
            <PhoneInput
              id="supplier-alternate-phone"
              value={formData.alternatePhone}
              onChange={(value) => handleInputChange("alternatePhone", value)}
              placeholder="Enter alternate phone"
            />
          </FormField>
        </CardContent>
      </Card>

      {/* Tax & Banking Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>Tax & Banking Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Tax ID" error={errors.taxId}>
              <FormTextInput
                placeholder="Tax ID number"
                value={formData.taxId}
                onChange={(e) => handleInputChange("taxId", e.target.value)}
              />
            </FormField>

            <FormField label="Registration Number" error={errors.registrationNumber}>
              <FormTextInput
                placeholder="Company registration number"
                value={formData.registrationNumber}
                onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Bank Name" error={errors.bankName}>
              <BankNameSelect
                value={formData.bankName}
                onValueChange={(value) => handleInputChange("bankName", value)}
                extraOptions={bankNames}
              />
            </FormField>

            <FormField label="Bank Branch" error={errors.bankBranch}>
              <FormTextInput
                placeholder="Branch name/code"
                value={formData.bankBranch}
                onChange={(e) => handleInputChange("bankBranch", e.target.value)}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Account Number" error={errors.accountNumber}>
              <FormTextInput
                placeholder="Bank account number"
                value={formData.accountNumber}
                onChange={(e) => handleInputChange("accountNumber", e.target.value)}
              />
            </FormField>

            <FormField label="Account Name" error={errors.accountName}>
              <FormTextInput
                placeholder="Account holder name"
                value={formData.accountName}
                onChange={(e) => handleInputChange("accountName", e.target.value)}
              />
            </FormField>
          </div>

          <FormField label="Payment Terms" error={errors.paymentTerms}>
            <FormSelect value={formData.paymentTerms} onValueChange={(value) => handleInputChange("paymentTerms", value)}>
              <option value="">Select payment terms...</option>
              {paymentTerms.map((term) => <option key={term} value={term}>{term}</option>)}
            </FormSelect>
          </FormField>
        </CardContent>
      </Card>

      {/* Status & Classification Section */}
      <Card>
        <CardHeader>
          <CardTitle>Supplier Status & Classification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Qualification Status" error={errors.qualificationStatus}>
              <FormSelect
                value={formData.qualificationStatus}
                onValueChange={(value) => handleInputChange("qualificationStatus", value)}
              >
                <option value="pending">Pending</option>
                <option value="pre_qualified">Pre-Qualified</option>
                <option value="qualified">Qualified</option>
                <option value="rejected">Rejected</option>
                <option value="inactive">Inactive</option>
              </FormSelect>
            </FormField>

            <FormField label="Qualification Date" error={errors.qualificationDate}>
              <FormTextInput
                type="date"
                value={formData.qualificationDate}
                onChange={(e) => handleInputChange("qualificationDate", e.target.value)}
              />
            </FormField>
          </div>

          <FormField label="Payment Methods" error={errors.paymentMethods}>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <Badge
                    key={method}
                    variant={formData.paymentMethods.includes(method) ? "default" : "outline"}
                    className="cursor-pointer capitalize"
                    onClick={() => {
                      handleInputChange(
                        "paymentMethods",
                        formData.paymentMethods.includes(method)
                          ? formData.paymentMethods.filter((m) => m !== method)
                          : [...formData.paymentMethods, method]
                      );
                    }}
                  >
                    {method.replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
            </div>
          </FormField>

          <FormField label="Supply Categories" error={errors.categories}>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {SUPPLY_CATEGORIES.map((cat) => (
                  <Badge
                    key={cat}
                    variant={formData.categories.includes(cat) ? "default" : "outline"}
                    className="cursor-pointer capitalize"
                    onClick={() => {
                      handleInputChange(
                        "categories",
                        formData.categories.includes(cat)
                          ? formData.categories.filter((c) => c !== cat)
                          : [...formData.categories, cat]
                      );
                    }}
                  >
                    {cat.replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
            </div>
          </FormField>

          <FormField label="Certifications" error={errors.certifications}>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {CERTIFICATIONS.map((cert) => (
                  <Badge
                    key={cert}
                    variant={formData.certifications.includes(cert) ? "default" : "outline"}
                    className="cursor-pointer capitalize"
                    onClick={() => {
                      handleInputChange(
                        "certifications",
                        formData.certifications.includes(cert)
                          ? formData.certifications.filter((c) => c !== cert)
                          : [...formData.certifications, cert]
                      );
                    }}
                  >
                    {cert.replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
            </div>
          </FormField>
        </CardContent>
      </Card>

      {/* Account Management Section */}
      <Card>
        <CardHeader>
          <CardTitle>Account Management</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField label="Account Manager" error={errors.accountManagerId}>
            <FormSelect
              value={formData.accountManagerId}
              onValueChange={(value) => handleInputChange("accountManagerId", value)}
            >
              <option value="">— Unassigned —</option>
              {teamMembers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name || u.email} {u.email ? `(${u.email})` : ""}
                </option>
              ))}
            </FormSelect>
          </FormField>
        </CardContent>
      </Card>

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField label="Notes" error={errors.notes}>
            <FormTextarea
              placeholder="Additional notes about this supplier..."
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={4}
            />
          </FormField>
        </CardContent>
      </Card>
    </>
  );
}
