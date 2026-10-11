import React, { useRef } from 'react';
import { jsPDF } from 'jspdf';
import { CheckCircle2, Download, ShieldCheck, X, FileText, QrCode } from 'lucide-react';
import { VoteReceipt } from '../types';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: VoteReceipt | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, receipt }) => {
  const receiptCardRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !receipt) return null;

  const downloadPdf = () => {
    const doc = new jsPDF();

    // Gov Header styling
    doc.setFillColor(10, 37, 64); // Navy
    doc.rect(0, 0, 210, 28, 'F');

    // Tricolor stripe
    doc.setFillColor(234, 88, 12); // Saffron
    doc.rect(0, 28, 70, 3, 'F');
    doc.setFillColor(255, 255, 255); // White
    doc.rect(70, 28, 70, 3, 'F');
    doc.setFillColor(22, 163, 74); // Green
    doc.rect(140, 28, 70, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('MAHAVOTE — MAHARASHTRA ELECTION MANAGEMENT PORTAL', 105, 14, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('EDUCATIONAL DEMONSTRATION RECEIPT • NOT AN OFFICIAL ELECTION SERVICE', 105, 22, { align: 'center' });

    // Document Title
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text('DIGITAL VOTE SUBMISSION RECEIPT', 105, 45, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Generated from Maharashtra Online Voting Management Prototype', 105, 52, { align: 'center' });

    // Receipt details box
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(20, 60, 170, 100, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);

    doc.text('Receipt Reference:', 30, 75);
    doc.setFont('courier', 'bold');
    doc.setTextColor(234, 88, 12);
    doc.text(receipt.receiptNumber, 80, 75);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Election Title:', 30, 90);
    doc.setFont('helvetica', 'normal');
    doc.text(doc.splitTextToSize(receipt.electionTitle, 100), 80, 90);

    doc.setFont('helvetica', 'bold');
    doc.text('Election Type:', 30, 108);
    doc.setFont('helvetica', 'normal');
    doc.text(receipt.electionType, 80, 108);

    doc.setFont('helvetica', 'bold');
    doc.text('Submission Time:', 30, 120);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(receipt.timestamp).toLocaleString(), 80, 120);

    doc.setFont('helvetica', 'bold');
    doc.text('Ballot Status:', 30, 132);
    doc.setTextColor(22, 163, 74);
    doc.text('CONFIRMED & COMMITTED (ANONYMIZED)', 80, 132);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text('Integrity SHA-256:', 30, 144);
    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    doc.text(doc.splitTextToSize(receipt.verificationHash, 100), 80, 144);

    // Ballot Secrecy Guarantee Notice
    doc.setFillColor(239, 246, 255);
    doc.setDrawColor(191, 219, 254);
    doc.roundedRect(20, 170, 170, 35, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 58, 138);
    doc.text('BALLOT SECRECY & PRIVACY CONSTITUTIONAL PRINCIPLE', 25, 178);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const privacyNotice =
      'In strict compliance with voting privacy principles, this receipt deliberately omits your candidate selection. Your ballot is stored in an independent anonymous repository with zero link to your voter profile. This document serves exclusively as proof of voting participation.';
    doc.text(doc.splitTextToSize(privacyNotice, 160), 25, 185);

    // Disclaimer footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Disclaimer: This receipt is from an educational demo portal. It is not an official Election Commission document.',
      105,
      280,
      { align: 'center' }
    );

    doc.save(`MahaVote_Receipt_${receipt.receiptNumber}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-white">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Official Vote Submission Receipt</h3>
              <p className="text-xs text-slate-400">Cryptographically Verified Demo Record</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Body */}
        <div ref={receiptCardRef} className="p-6 space-y-5 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Receipt Number
              </span>
              <p className="font-mono text-xl font-bold text-orange-600 dark:text-orange-400">
                {receipt.receiptNumber}
              </p>
            </div>
            <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300">
              <QrCode className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-slate-500 font-medium">Election:</span>
              <p className="font-semibold text-slate-900 dark:text-white">{receipt.electionTitle}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-500 font-medium">Type:</span>
                <p className="text-slate-800 dark:text-slate-200 font-medium">{receipt.electionType}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Timestamp:</span>
                <p className="text-slate-800 dark:text-slate-200 font-medium">
                  {new Date(receipt.timestamp).toLocaleString()}
                </p>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-500 font-medium">Verification Hash (SHA-256):</span>
              <p className="font-mono text-xs text-slate-600 dark:text-slate-400 break-all bg-slate-50 dark:bg-slate-800/80 p-2 rounded border border-slate-200 dark:border-slate-800 mt-1">
                {receipt.verificationHash}
              </p>
            </div>
          </div>

          {/* Secrecy Warning */}
          <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
              <strong className="font-semibold block mb-0.5">Ballot Secrecy Maintained:</strong>
              This receipt confirms that your ballot was anonymously recorded into the election database.
              To protect the secrecy of the vote, your selected candidate is deliberately not shown on this receipt.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={downloadPdf}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Receipt</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
