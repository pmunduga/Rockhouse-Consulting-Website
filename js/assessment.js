// ── EmailJS config — sign up free at emailjs.com, connect an email service
// (Gmail is simplest), create a template with the variables listed below,
// and replace these three placeholders with your real IDs.
const EMAILJS_PUBLIC_KEY = "asGJezKaFBwII_xMA";
const EMAILJS_SERVICE_ID = "service_2bq1tup";
const EMAILJS_TEMPLATE_ID = "template_dvmq5hn";
// Template variables this sends: to_name, to_email, band_headline,
// narrative, domain_summary (multi-line), company.
if (window.emailjs) emailjs.init(EMAILJS_PUBLIC_KEY);

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xzebyrza";

// Domains match the real AERO Enterprise Transformation Assessment:
// Strategic Alignment, Technical Enablement, Decision Governance, Operational Adoption.
const QUESTIONS = [
  { dim: "Strategic Alignment", text: "Does a written Strategic Intent — the business outcome an AI or transformation initiative should achieve — actually exist, or would it need to be written for the first time?",
    options: ["Would need to be written from scratch", "Exists informally, not written down anywhere shared", "Documented, though not consistently referenced", "A clear, executive-approved statement guides every related decision"] },
  { dim: "Strategic Alignment", text: "Does executive leadership actively sponsor transformation initiatives, or mostly approve the budget?",
    options: ["Budget approval only, limited ongoing involvement", "Occasional check-ins", "Regular sponsorship and review", "Active, visible ownership at the executive level"] },
  { dim: "Strategic Alignment", text: "Is there a defined risk appetite for how much error a first governed experiment can tolerate?",
    options: ["No — risk tolerance has never been discussed explicitly", "Implied, but never stated out loud", "Generally understood by leadership", "Explicitly defined and referenced when scoping new work"] },

  { dim: "Technical Enablement", text: "Are the Functional Signals a decision needs — the data that actually feeds it — trusted and available when needed?",
    options: ["Scattered across spreadsheets and individual systems", "Centralized but not well modeled or governed", "Reasonably governed with defined ownership", "Fully governed, trusted, and continuously available"] },
  { dim: "Technical Enablement", text: "Can a non-technical leader get a trustworthy answer to an operational question in under a day?",
    options: ["No — it usually takes a special request to IT/analytics", "Sometimes, depending on who's available", "Usually, through existing dashboards", "Yes, self-serve and reliable"] },
  { dim: "Technical Enablement", text: "How would you rate platform and systems integration — can the data that matters actually reach the place a decision gets made?",
    options: ["Manual reconciliation between disconnected systems", "Some integration, but fragile and hard to maintain", "Stable integration owned by a defined team", "Reliable, governed integration embedded in daily operations"] },

  { dim: "Decision Governance", text: "Are Decision Rights — who's authorized to decide what — explicit, documented, and consistently applied?",
    options: ["Rarely clear — decisions default to whoever escalates loudest", "Clear for some decisions, ambiguous for most", "Clear for most decisions, with a few gray areas", "Fully documented across the organization"] },
  { dim: "Decision Governance", text: "If an automated or AI-assisted system made a wrong call today, is there a tested escalation path?",
    options: ["No — we'd likely find out from a customer or downstream failure", "Possibly, if someone happened to notice", "Yes, through existing monitoring, though escalation is informal", "Yes — a defined, tested escalation path exists"] },
  { dim: "Decision Governance", text: "How would you describe accountability for a delegated decision that goes wrong?",
    options: ["Unclear — it would likely become a blame exercise after the fact", "Generally understood but not written down", "Assigned by role, with occasional ambiguity", "Explicitly assigned and preserved even as authority is delegated"] },

  { dim: "Operational Adoption", text: "How does your workforce typically respond to new systems or process changes?",
    options: ["High resistance, frequent workarounds", "Mixed — depends heavily on the team", "Generally receptive with proper change management", "Strong track record of adoption"] },
  { dim: "Operational Adoption", text: "Is there dedicated capacity — not just \"extra time\" — for leading change initiatives?",
    options: ["No — it competes with day-to-day work", "Informally, when someone volunteers", "Partially dedicated roles", "Formal change-management capacity"] },
  { dim: "Operational Adoption", text: "How confident are you that a process improvement made today will still be followed in 12 months?",
    options: ["Not very — things tend to drift back", "Some things stick, most don't", "Most things stick with occasional reinforcement", "High confidence — sustained via standard work and accountability reviews"] },
];

const DIMENSIONS = ["Strategic Alignment", "Technical Enablement", "Decision Governance", "Operational Adoption"];

const DIM_NARRATIVE = {
  "Strategic Alignment": "without a clear, shared statement of what a first experiment should achieve, even a technically strong pilot tends to drift or stall for lack of a decision-maker who owns it",
  "Technical Enablement": "the data and systems a decision would draw on aren't yet trustworthy enough to hand any part of that decision to an agent",
  "Decision Governance": "decision authority isn't explicit enough yet — this is the domain that most often turns out to be the real constraint, even when it doesn't look that way from inside",
  "Operational Adoption": "the workforce and change-management muscle to actually sustain a new way of working isn't in place yet, which tends to matter more than the technology itself"
};

let current = 0;
const answers = new Array(QUESTIONS.length).fill(null);

const screenIntro = document.getElementById('screen-intro');
const screenQuiz = document.getElementById('screen-quiz');
const screenResults = document.getElementById('screen-results');

document.getElementById('btn-start').addEventListener('click', () => {
  screenIntro.classList.add('hidden');
  screenQuiz.classList.remove('hidden');
  renderQuestion();
});

document.getElementById('btn-back').addEventListener('click', () => {
  if (current > 0) { current--; renderQuestion(); }
});

function renderQuestion(){
  const q = QUESTIONS[current];
  document.getElementById('progress-label').textContent = `Question ${current + 1} of ${QUESTIONS.length}`;
  document.getElementById('progress-fill').style.width = `${(current / QUESTIONS.length) * 100}%`;
  document.getElementById('q-dim').textContent = q.dim;
  document.getElementById('q-text').textContent = q.text;
  document.getElementById('btn-back').style.visibility = current === 0 ? 'hidden' : 'visible';

  const optWrap = document.getElementById('q-options');
  optWrap.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'q-option' + (answers[current] === i + 1 ? ' selected' : '');
    btn.textContent = opt;
    btn.addEventListener('click', () => {
      answers[current] = i + 1;
      if (current < QUESTIONS.length - 1) {
        current++;
        renderQuestion();
      } else {
        showResults();
      }
    });
    optWrap.appendChild(btn);
  });
}

function showResults(){
  screenQuiz.classList.add('hidden');
  screenResults.style.display = 'block';

  const dimScores = {};
  DIMENSIONS.forEach(d => dimScores[d] = { total: 0, count: 0 });
  QUESTIONS.forEach((q, i) => {
    dimScores[q.dim].total += answers[i] || 0;
    dimScores[q.dim].count += 1;
  });

  // Find the weakest domain (ties broken by canonical order) — this is the
  // point of the assessment: read as a profile, not a blended score.
  let weakest = DIMENSIONS[0];
  let weakestPct = dimScores[weakest].total / (dimScores[weakest].count * 4);
  DIMENSIONS.forEach(d => {
    const pct = dimScores[d].total / (dimScores[d].count * 4);
    if (pct < weakestPct) { weakest = d; weakestPct = pct; }
  });

  const overall = Object.values(dimScores).reduce((sum, d) => sum + d.total, 0);

  let stage;
  if (overall <= 21) stage = "early";
  else if (overall <= 31) stage = "developing";
  else if (overall <= 41) stage = "solid";
  else stage = "strong";

  const stageHeadline = {
    early: "A foundational first step makes sense",
    developing: "A scoped, well-governed pilot is the right next move",
    solid: "You're in a strong position to pilot",
    strong: "You're positioned to scale, not just pilot"
  }[stage];

  const summary = `Read as a profile rather than a single score: your lowest domain is ${weakest}. In practice, that usually means ${DIM_NARRATIVE[weakest]}. That's the domain worth addressing before — or alongside — any pilot, regardless of how ready the rest of the picture looks.`;

  document.getElementById('result-band').textContent = stageHeadline;
  document.getElementById('result-summary').textContent = summary;

  // Stash the computed result so the lead-capture form below can send it
  // as the actual email content, not just notify Patrick that someone filled it out.
  latestResult = { stageHeadline, weakest, summary, dimScores };

  const dimWrap = document.getElementById('dim-scores');
  dimWrap.innerHTML = '';
  DIMENSIONS.forEach(d => {
    const s = dimScores[d];
    const pct = (s.total / (s.count * 4)) * 100;
    const row = document.createElement('div');
    row.className = 'dim-score';
    row.innerHTML = `<span style="min-width:190px;">${d}${d === weakest ? ' <span class="small" style="color:var(--teal-dark);">— lowest</span>' : ''}</span><div class="dim-bar"><i style="width:${pct}%"></i></div><span class="small">${s.total}/${s.count * 4}</span>`;
    dimWrap.appendChild(row);
  });
}

let latestResult = null;

function buildDomainSummary(dimScores){
  return DIMENSIONS.map(d => `${d}: ${dimScores[d].total}/${dimScores[d].count * 4}`).join('\n');
}

const leadForm = document.getElementById('lead-form');
if (leadForm) {
  leadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('lead-submit');
    const status = document.getElementById('lead-status');
    const name = document.getElementById('lead-name').value;
    const email = document.getElementById('lead-email').value;
    const company = document.getElementById('lead-company').value;

    submitBtn.disabled = true;
    status.textContent = 'Sending…';

    const payload = {
      name, email, company,
      assessment_band: latestResult ? latestResult.stageHeadline : '',
      assessment_weakest: latestResult ? latestResult.weakest : '',
      assessment_scores: latestResult ? JSON.stringify(latestResult.dimScores) : ''
    };

    try {
      // Notify Patrick via Formspree — fetch instead of a native form POST
      // so the page doesn't navigate away to Formspree's own thank-you page.
      const formspreePromise = fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // Email the visitor their actual personalized report via EmailJS.
      let emailjsPromise = Promise.resolve();
      if (window.emailjs && latestResult) {
        emailjsPromise = emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          to_name: name,
          to_email: email,
          company: company,
          band_headline: latestResult.stageHeadline,
          narrative: latestResult.summary,
          domain_summary: buildDomainSummary(latestResult.dimScores)
        });
      }

      await Promise.all([formspreePromise, emailjsPromise]);

      leadForm.classList.add('hidden');
      document.getElementById('lead-confirmation').classList.remove('hidden');
    } catch (err) {
      status.textContent = "Something went wrong sending that — try again, or reach out directly via the Contact page.";
      submitBtn.disabled = false;
    }
  });
}
