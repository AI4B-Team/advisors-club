import { ArrowRight, Check, Minus, Zap } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function PricingSection() {
  return (
      <div className="pricing-section" id="pricing">
        <div className="pricing-inner">
          <div className="price-hd">
            <div className="sc-eyebrow">Simple, Honest Pricing</div>
            <h2 className="sc-h2">Half The Price.<br />Twice The Power.</h2>
            <p className="sc-sub" style={{ maxWidth: 720, margin: "0 auto" }}>Kajabi charges $179/mo. Circle & Skool charge $99/mo.<br />AdvisorsClub starts at $0 — and our best plan costs less than a dinner out.</p>
          </div>
          <div className="plans">
            <div className="plan">
              <div className="plan-tier">Starter</div>
              <div className="plan-price"><sup>$</sup>0</div>
              <div className="plan-per">Free Forever · 1 Club</div>
              <div className="plan-div" />
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Up to 100 Club Members</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />1 Course, Unlimited Lessons</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Club Feed & Discussions</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Basic Gamification</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Stripe Payments (5% Fee)</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />AIVA (10 Prompts/mo)</div>
              <div className="pf"><Minus size={14} className="pfd" />Custom Domain</div>
              <div className="pf"><Minus size={14} className="pfd" />Virtual Conferences</div>
              <div className="pf"><Minus size={14} className="pfd" />Email Marketing</div>
              <Link to="/signup" className="plan-cta ghost">Get Started Free</Link>
            </div>
            <div className="plan hot">
              <div className="plan-tag" style={{display:"inline-flex",alignItems:"center",gap:4}}><Zap size={11} fill="currentColor" strokeWidth={0} />Most Popular</div>
              <div className="plan-tier">Advisor</div>
              <div className="plan-price"><sup>$</sup>47</div>
              <div className="plan-per">Per Month · Unlimited Members</div>
              <div className="plan-div" />
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Unlimited Club Members</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Unlimited Courses & Lessons</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Custom Domain & Full Branding</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />AIVA AI Agent — Unlimited</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Virtual Conferences (200 Cap)</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Challenges Engine</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Full Gamification Suite</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Stripe Payments (2% Fee)</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Email Marketing (5k Contacts)</div>
              <Link to="/signup" className="plan-cta solid">Start 14-Day Free Trial <ArrowRight size={14} strokeWidth={3} style={{display:"inline",verticalAlign:"-2px",marginLeft:4}} /></Link>
            </div>
            <div className="plan">
              <div className="plan-tier">Pro</div>
              <div className="plan-price"><sup>$</sup>97</div>
              <div className="plan-per">Per Month · Everything Unlimited</div>
              <div className="plan-div" />
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Everything in Advisor</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />0% Transaction Fees</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Multiple Clubs</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Unlimited Virtual Conferences</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Full Email Marketing (100k)</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Sales Funnel Builder</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Advanced Analytics & CRM</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Team Members & Roles</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Branded Mobile App</div>
              <Link to="/signup" className="plan-cta ghost">Start 14-Day Free Trial <ArrowRight size={14} strokeWidth={3} style={{display:"inline",verticalAlign:"-2px",marginLeft:4}} /></Link>
            </div>
          </div>
          <p style={{ textAlign: "center", fontSize: 13, color: "var(--ac-muted)", marginTop: 24 }}>
            All Plans Include a 14-Day Free Trial · No Credit Card Required · Cancel Anytime
          </p>
        </div>
      </div>
  );
}
