import { useEffect, useState } from 'react'
import { ArrowRight, BriefcaseBusiness, ChevronRight, CircleCheck, FileText, Gavel, Landmark, Mail, Menu, MessageCircle, ShieldCheck, Sparkles, X } from 'lucide-react'
import { api } from './api'
import { erpApi } from './erpApi'

const staticServices = [
  { name: 'Accounting & Finance', category: 'Finance', description: 'Accounting, financial reporting and finance support.' },
  { name: 'Taxation', category: 'Tax', description: 'Direct tax, indirect tax and related advisory support.' },
  { name: 'Audit & Assurance', category: 'Assurance', description: 'Audit, assurance and financial review support.' },
  { name: 'Corporate & Secretarial', category: 'Corporate', description: 'Company secretarial and corporate compliance support.' },
  { name: 'Legal Support', category: 'Legal', description: 'Coordinated legal and documentation support.' },
  { name: 'Business Advisory', category: 'Advisory', description: 'Business, financial and strategic advisory support.' },
  { name: 'Compliance & Outsourcing', category: 'Operations', description: 'Recurring compliance and outsourced professional operations.' }
]

const expertise = [
  ['Finance', Landmark], ['Tax', FileText], ['Audit', ShieldCheck], ['Corporate', BriefcaseBusiness],
  ['Legal', Gavel], ['Advisory', Sparkles]
]

function App() {
  const [services, setServices] = useState(staticServices)
  const [menu, setMenu] = useState(false)
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name:'', email:'', phone:'', company:'', service:'', message:'' })
  const [adminOpen, setAdminOpen] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [adminLoading, setAdminLoading] = useState(false)
  const [adminError, setAdminError] = useState('')

  useEffect(() => {
    api.services().then(setServices).catch(() => {})
  }, [])

  useEffect(() => {
    const items = document.querySelectorAll('.reveal-section, .reveal-item')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.14 })
    items.forEach(item => observer.observe(item))
    return () => observer.disconnect()
  }, [services])

  const submitAdmin = async (e) => {
    e.preventDefault()
    setAdminLoading(true)
    setAdminError('')
    try {
      const session = await erpApi.adminLogin(adminPassword)
      localStorage.setItem('bb_session', JSON.stringify(session))
      window.location.hash = '#/erp-admin'
    } catch (err) {
      setAdminError(err.message || 'Unable to sign in.')
    } finally {
      setAdminLoading(false)
    }
  }

  const submit = async (e) => {
    e.preventDefault(); setError(''); setSending(true)
    try {
      await api.submitEnquiry(form)
      setSent(true); setForm({ name:'', email:'', phone:'', company:'', service:'', message:'' })
    } catch (err) { setError(err.message) }
    finally { setSending(false) }
  }

  return <div className="site">
    <header className="nav">
      <a className="brand" href="#top" onClick={()=>setMenu(false)} aria-label="BrainBanque Global Solutions (P) Ltd">
        <img className="brand-logo header-logo" src={`${import.meta.env.BASE_URL}logo/Brainbanque-logo%20without%20BG.jpg`} alt="BrainBanque Global Solutions" />
        <span className="brand-name">
          <strong><span className="brand-brain">Brain</span><span className="brand-banque">Banque</span></strong>
          <small>Global Solutions (P) Ltd</small>
        </span>
      </a>
      <button className="menu-btn" onClick={()=>setMenu(!menu)} aria-label="Menu">{menu?<X/>:<Menu/>}</button>
      <nav className={menu?'nav-links open':'nav-links'}>
        <div className="header-contact">
          <a href="https://wa.me/919003060652" target="_blank" rel="noreferrer" aria-label="WhatsApp 9003060652"><MessageCircle size={15}/><span>9003060652</span></a>
          <a href="mailto:Info@Brainbanque.in" aria-label="Email Info@Brainbanque.in"><Mail size={15}/><span>Info@Brainbanque.in</span></a>
        </div>
        <a className="nav-cta login-btn" href="#/erp" onClick={()=>setMenu(false)}>Login <ArrowRight size={16}/></a>
      </nav>
    </header>

    <main id="top">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">PROFESSIONAL SERVICES • ADVISORY • EXECUTION</p>
          <h1>Complex work.<br/><em>Clear direction.</em></h1>
          <p className="hero-text">Brainbanque brings together multidisciplinary professional expertise to help businesses navigate finance, taxation, compliance, legal and advisory requirements.</p>
          <div className="hero-actions">
            <a className="button primary" href="#contact">Discuss your requirement <ArrowRight size={17}/></a>
            <a className="text-link" href="#services">Explore services <ChevronRight size={17}/></a>
          </div>
        </div>
        <div className="hero-panel">
          <div className="hero-logo-orb" aria-label="BrainBanque logo">
            <div className="logo-ring logo-ring-one"></div>
            <div className="logo-ring logo-ring-two"></div>
            <div className="logo-ring logo-ring-three"></div>
            <div className="logo-smile"></div>
            <img src={`${import.meta.env.BASE_URL}logo/Brainbanque-logo%20without%20BG.jpg`} alt="BrainBanque Global Solutions" />
          </div>
        </div>
      </section>

      <section className="trust-strip"><span>BUILT AROUND PROFESSIONAL EXPERTISE</span><div>{['CA','CS','LEGAL','FINANCE','ADVISORY'].map(x=><b key={x}>{x}</b>)}</div></section>

      <section className="section intro reveal-section" id="about">
        <div><h2>Professional expertise, coordinated around your requirement.</h2></div>
        <div className="intro-copy"><p>Businesses rarely have one isolated problem. A tax question can touch accounting. A corporate decision can involve legal and compliance work. An expansion can require finance, structuring and execution.</p><p>Brainbanque is designed around that reality — bringing the right professional capabilities together and coordinating the work from requirement to delivery.</p></div>
      </section>

      <section className="section services reveal-section" id="services">
        <div className="section-head"><div><h2>Services built for the work behind the business.</h2></div><span className="section-index">01 — 07</span></div>
        <div className="service-grid">{services.map((s,i)=><article className="service-card reveal-item" key={s.id||s.name}><span>0{i+1}</span><h3>{s.name}</h3><p>{s.description}</p><a href="#contact">Discuss this service <ArrowRight size={15}/></a></article>)}</div>
      </section>

      <section className="section dark expertise reveal-section" id="expertise">
        <div className="section-head"><div><h2>Different disciplines.<br/>One coordinated approach.</h2></div><p className="dark-copy">Our network is built around professional specialists and practical execution — so clients can access the expertise they need without managing disconnected workstreams.</p></div>
        <div className="expertise-grid">{expertise.map(([name,Icon],i)=><div className="expertise-item reveal-item" key={name}><Icon size={20}/><span>{name}</span><small>0{i+1}</small></div>)}</div>
      </section>

      <section className="section process reveal-section" id="how-we-work">
        <div className="section-head"><div><h2>From requirement to execution.</h2></div></div>
        <div className="steps">{[['01','Understand','We clarify the requirement, context, scope and expected outcome.'],['02','Coordinate','The right professional capabilities are brought together for the engagement.'],['03','Execute','Work is managed through defined responsibilities, timelines and review points.'],['04','Deliver','You receive a clear outcome, with documentation and ongoing support where required.']].map(([n,t,d])=><div className="step reveal-item" key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></div>)}</div>
      </section>

      <section className="section statement reveal-section"><div className="statement-box"><CircleCheck size={28}/><p>Professional work should feel <strong>organised, accountable and clear.</strong></p></div></section>

      <section className="section contact reveal-section" id="contact">
        <div className="contact-intro"><p className="eyebrow">START A CONVERSATION</p><h2>Tell us what you need to get done.</h2><p>Share the requirement. We’ll understand the context and identify the right path forward.</p></div>
        <form className="form" onSubmit={submit}>
          {sent ? <div className="success"><CircleCheck size={42}/><h3>Thank you.</h3><p>Your requirement has been received. Our team will get in touch.</p><button type="button" className="button outline" onClick={()=>setSent(false)}>Send another enquiry</button></div> :
          <><div className="form-row"><label>Name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name"/></label><label>Company<input value={form.company} onChange={e=>setForm({...form,company:e.target.value})} placeholder="Company / organisation"/></label></div>
          <div className="form-row"><label>Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@company.com"/></label><label>Phone<input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+91"/></label></div>
          <label>Service<select value={form.service} onChange={e=>setForm({...form,service:e.target.value})}><option value="">Select an area</option>{services.map(s=><option key={s.name}>{s.name}</option>)}</select></label>
          <label>Requirement<textarea required value={form.message} onChange={e=>setForm({...form,message:e.target.value})} rows="5" placeholder="Briefly tell us what you need help with..."/></label>
          {error && <p className="form-error">{error}</p>}<button className="button primary full" disabled={sending}>{sending?'Sending…':'Send requirement'} <ArrowRight size={17}/></button></>}
        </form>
      </section>
    </main>

    <footer className="footer">
      <div className="footer-main">
        <div className="footer-brand-block">
          <div className="footer-brand-card">
            <img className="footer-logo-image" src={`${import.meta.env.BASE_URL}logo/Brainbanque-logo%20without%20BG.jpg`} alt="BrainBanque Global Solutions" />
            <div className="footer-company-name">
              <strong><span className="brand-brain">Brain</span><span className="brand-banque">Banque</span></strong>
              <small>Global Solutions (P) Ltd</small>
            </div>
          </div>
          <p className="footer-tagline">Advisory. Expertise. Execution.</p>
        </div>

        <div className="footer-column">
          <h4>Company</h4>
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#expertise">Expertise</a>
          <a href="#how-we-work">How we work</a>
        </div>

        <div className="footer-column">
          <h4>Connect</h4>
          <a href="#contact">Contact</a>
          <a href="#contact">Discuss a requirement</a>
          <a href="#contact">Start a conversation</a>
        </div>

        <div className="footer-column footer-action">
          <h4>Work with us</h4>
          <p>Tell us what you need to get done.</p>
          <a className="footer-cta" href="#contact">Discuss a requirement <ArrowRight size={15}/></a>
        </div>
      </div>

      <div className="footer-bottom">
        <div>© {new Date().getFullYear()} BrainBanque Global Solutions (P) Ltd. All rights reserved.</div>
        <div className="footer-legal">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Use</a>
        </div>
      </div>
    </footer>
  </div>
}
export default App