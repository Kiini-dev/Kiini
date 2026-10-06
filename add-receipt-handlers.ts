// Action handlers to add after line 89 in Receipts.tsx

const actionHandlers = `
  // Add email addresses to receipts
  const initialReceipts: ReceiptRecord[] = [
    {
      id: "1",
      receiptNumber: "REC-00001",
      client: "Acme Corporation",
      clientEmail: "billing@acmecorp.com",
      amount: 986000,
      paymentMethod: "bank-transfer",
      date: "2024-02-10",
      invoice: "INV-2024-001",
      status: "issued",
    },
    // ... rest of receipts with clientEmail added
  ];

  // Action handlers
  const handleView = (id: string | number) => {
    navigate(\`/receipts/\${id}\`);
  };

  const handleEdit = (id: string | number) => {
    const receipt = receipts.find((rec) => rec.id === String(id));
    if (receipt) {
      toast.info(\`Edit functionality for \${receipt.receiptNumber} - Opening editor...\`);
    }
  };

  const handleDeleteClick = (id: string | number) => {
    const receipt = receipts.find((rec) => rec.id === String(id));
    if (receipt) {
      setSelectedReceipt(receipt);
      setDeleteModalOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedReceipt) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setReceipts(receipts.filter((rec) => rec.id !== selectedReceipt.id));
      setSelectedReceipt(null);
    }
  };

  const handleDownload = async (id: string | number) => {
    const receipt = receipts.find((rec) => rec.id === String(id));
    if (!receipt) return;

    const toastId = toast.loading(\`Generating receipt \${receipt.receiptNumber}...\`);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const content = \`
OFFICIAL RECEIPT
\${receipt.receiptNumber}
Generated: \${new Date().toLocaleString()}

KIINI SOLUTIONS
P.O. Box 12345, Nairobi, Kenya
Email: info@kiini.africa
Phone: +254 700 000 000
Website: www.kiini.africa

RECEIVED FROM:
\${receipt.client}
\${receipt.clientEmail || ""}

Receipt Date: \${new Date(receipt.date).toLocaleDateString()}
Invoice Reference: \${receipt.invoice}
Payment Method: \${receipt.paymentMethod.toUpperCase().replace("-", " ")}

AMOUNT RECEIVED: Ksh ${(receipt.amount / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}

Status: \${receipt.status.toUpperCase()}

This is an official receipt for payment received.
For any inquiries, please contact us at info@kiini.africa

Thank you for your business!
      \`.trim();

      const blob = new Blob([content], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = \`\${receipt.receiptNumber}-\${Date.now()}.txt\`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(\`\${receipt.receiptNumber} downloaded successfully\`, { id: toastId });
    } catch (error) {
      toast.error(\`Failed to download receipt\`, { id: toastId });
    }
  };

  const handleEmailClick = (id: string | number) => {
    const receipt = receipts.find((rec) => rec.id === String(id));
    if (receipt) {
      setSelectedReceipt(receipt);
      setEmailModalOpen(true);
    }
  };

  const handleEmailSend = async (email: string, subject: string, message: string) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  };
`;

console.log(actionHandlers);

