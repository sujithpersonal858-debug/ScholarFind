import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ChevronDown, ChevronUp, Mail, FileCheck, Compass, ShieldAlert } from 'lucide-react';

export default function HelpSupport() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const faqs = [
    {
      q: 'How does ScholarFind match me with scholarships?',
      a: 'ScholarFind checks the details in your profile (such as your education level, marks percentage, family income, and state) against the strict rules specified in official government and foundation notifications. If you meet all the mandatory rules, the scholarship is marked as a match.'
    },
    {
      q: 'Does matching mean I am guaranteed to receive the scholarship?',
      a: 'No. Matching on ScholarFind is a helpful preliminary check. Final approval, document verification, and actual scholarship disbursement are determined solely by the government ministry or sponsoring organization.'
    },
    {
      q: 'How do I apply for a scholarship?',
      a: 'When you find a matching scholarship, click the "Apply Now" button on the scholarship card or detail page. This takes you directly to the official government portal (like the National Scholarship Portal) where you can register and submit your documents.'
    },
    {
      q: 'What documents are usually required?',
      a: 'Commonly requested documents include: Previous examination marksheet, Income certificate issued by a competent revenue authority, Domicile certificate, Aadhaar card, College bonafide/admission fee receipt, and Bank account passbook in the student\'s name.'
    },
    {
      q: 'Is ScholarFind free to use?',
      a: 'Yes, ScholarFind is 100% free for students to discover and track scholarship opportunities.'
    }
  ];

  return (
    <div className="page-container" style={{ maxWidth: '820px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2>Help &amp; Support</h2>
        <p className="text-muted text-sm" style={{ marginTop: '2px' }}>
          Find answers to common questions about scholarships, eligibility, and applications.
        </p>
      </div>

      {/* Guide Cards */}
      <div className="form-grid" style={{ marginBottom: '32px' }}>
        <div className="card">
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--blue-50)', color: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <FileCheck size={20} />
          </div>
          <h4 style={{ marginBottom: '6px' }}>Step 1: Fill Your Profile</h4>
          <p className="text-sm text-muted">
            Enter your state, education level, marks, and annual income in the profile section.
          </p>
        </div>

        <div className="card">
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--success-bg)', color: 'var(--success-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <Compass size={20} />
          </div>
          <h4 style={{ marginBottom: '6px' }}>Step 2: Check Matches</h4>
          <p className="text-sm text-muted">
            See your personalized recommendations and clear explanations for why you qualify.
          </p>
        </div>

        <div className="card">
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--warning-bg)', color: 'var(--warning-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <ShieldAlert size={20} />
          </div>
          <h4 style={{ marginBottom: '6px' }}>Step 3: Apply On Official Site</h4>
          <p className="text-sm text-muted">
            Use the verified link to apply on the official government or foundation portal.
          </p>
        </div>
      </div>

      {/* FAQs */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <h3 style={{ marginBottom: '18px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
          Frequently Asked Questions
        </h3>

        <div>
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              style={{
                borderBottom: idx < faqs.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                padding: '16px 0'
              }}
            >
              <div
                onClick={() => toggle(idx)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              >
                <h4 style={{ fontSize: '0.975rem', margin: 0, color: 'var(--navy-900)' }}>{faq.q}</h4>
                {openIndex === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              {openIndex === idx && (
                <p className="text-sm text-muted" style={{ marginTop: '10px', lineHeight: '1.6' }}>
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact box */}
      <div className="card-subtle" style={{ textAlign: 'center', padding: '28px 20px', backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)' }}>
        <Mail size={32} color="var(--blue-600)" style={{ margin: '0 auto 10px' }} />
        <h4 style={{ marginBottom: '6px' }}>Still need assistance?</h4>
        <p className="text-sm text-muted" style={{ maxWidth: '440px', margin: '0 auto 16px' }}>
          Reach out to our support team for questions regarding scheme details and technical assistance.
        </p>
        <span className="badge badge-neutral" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
          support@scholarfind.com
        </span>
      </div>
    </div>
  );
}
