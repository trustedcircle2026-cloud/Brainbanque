import { useEffect, useState } from 'react'
import { ArrowRight, CheckCircle2, Mail, MessageCircle, Phone, ShieldCheck, Sparkles, BriefcaseBusiness, Scale, Landmark, FileText, Gavel } from 'lucide-react'
import { api } from './api'

const base = import.meta.env.BASE_URL
const logo = `${base}logo/Brainbanque-logo%20without%20BG.jpg`
const whatsapp = 'https://wa.me/919003060652'
const email = 'mailto:Info@Brainbanque.in'

const nav = [
  ['About','about.html'], ['Services','services.html'], ['Expertise','expertise.html'],
  ['How we work','how-we-work.html'], ['Contact','contact.html']
]

const services = [
  ['Accounting & Finance','Books, reporting, MIS, controls and finance operations built around accurate decision-making.',BriefcaseBusiness],
  ['Taxation','Direct tax, GST and tax compliance support with practical issue resolution.',FileText],
  ['Audit & Assurance','Structured audit support, financial review, controls and assurance work.',ShieldCheck],
  ['Corporate & Secretarial','Entity compliance, governance, filings and corporate documentation.',Landmark],
  ['Legal Support','Commercial documentation, contracts and coordinated legal support.',Gavel],
  ['Business Advisory','Business structuring, finance, compliance and execution support for key decisions.',Scale],
  ['Compliance & Outsourcing','Reliable recurring compliance and outsourced back-office execution.',CheckCircle2]
]

function Header(){
  return <header className="site-header">
    <a className="site-brand" href="index.html">
      <img src={logo} alt="BrainBanque Global Solutions"/>
      <span><strong><i>Brain</i><b>Banque</b></strong><small>Global Solutions (P) Ltd</small></span>
    </a>
    <nav className="site-nav">
      {nav.map(([label,href])=><a key={href} href={href}>{label}</a>)}
      <div className="header-contact">
        <a href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={14}/>9003060652</a>
        <a href={email}><Mail size={14}/>Info@Brainbanque.in</a>
      </div>
      <a className="site-login" href="index.html#/erp">Login <ArrowRight size={15}/></a>
    </nav>
  </header>
}

function Footer(){
  return <footer className="site-footer">
    <div className="footer-grid">
      <div>
        <div className="footer-brand"><img src={logo} alt="BrainBanque"/><span><strong><i>Brain</i><b>Banque</b></strong><small>Global Solutions (P) Ltd</small></span></div>
        <p>Professional expertise. Clear direction. Coordinated execution.</p>
      </div>
      <div><h4>Explore</h4>{nav.map(([label,href])=><a key={href} href={href}>{label}</a>)}</div>
      <div><h4>Connect</h4><a href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={14}/> WhatsApp</a><a href={email}><Mail size={14}/> Email us</a><a href="index.html#/erp">ERP Login</a></div>
      <div><h4>Start a conversation</h4><p>Tell us what you need help with and we will identify the right path.</p><a className="footer-cta" href="contact.html">Contact BrainBanque <ArrowRight size={15}/></a></div>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} BrainBanque Global Solutions (P) Ltd. All rights reserved.</span><span>Privacy Policy · Terms of Use</span></div>
  </footer>
}

function Reveal({children,className=''}){ return <div className={'site-reveal '+className}>{children}</div> }

function Home(){
  return <>
    <section className="site-hero">
      <div className="hero-copy">
        <span className="site-kicker">PROFESSIONAL SERVICES · ADVISORY · EXECUTION</span>
        <h1>Complex work.<em>Clear direction.</em></h1>
        <p>BrainBanque brings together multidisciplinary professional expertise to help businesses navigate finance, taxation, compliance, legal and advisory requirements.</p>
        <div className="hero-actions"><a className="primary-btn" href="contact.html">Discuss your requirement <ArrowRight size={17}/></a><a className="text-btn" href="services.html">Explore services <ArrowRight size={16}/></a></div>
      </div>
      <div className="hero-mark"><div className="mark-rings"></div><img src={logo} alt="BrainBanque logo"/></div>
    </section>

    <div className="trust-line"><span>BUILT AROUND PROFESSIONAL EXPERTISE</span><div><b>CA</b><b>CS</b><b>LEGAL</b><b>FINANCE</b><b>ADVISORY</b></div></div>

    <Reveal><section className="home-section">
      <div className="section-intro"><span className="site-kicker">WHY BRAINBANQUE</span><h2>One coordinated partner for work that crosses professional boundaries.</h2></div>
      <div className="feature-grid">
        <article><Sparkles/><h3>Multidisciplinary</h3><p>Bring accounting, tax, audit, legal, finance and advisory capabilities together around one requirement.</p></article>
        <article><ShieldCheck/><h3>Structured</h3><p>Clear ownership, defined deliverables and disciplined execution from requirement to completion.</p></article>
        <article><ArrowRight/><h3>Practical</h3><p>Advice designed to move work forward — not simply add another layer of complexity.</p></article>
      </div>
    </section></Reveal>

    <Reveal><section className="home-section soft-section">
      <div className="section-intro"><span className="site-kicker">OUR CAPABILITIES</span><h2>Professional services for the decisions and work behind the business.</h2></div>
      <div className="service-mini-grid">{services.slice(0,6).map(([name,desc,Icon])=><a href="services.html" className="service-mini" key={name}><Icon/><h3>{name}</h3><p>{desc}</p><ArrowRight size={16}/></a>)}</div>
      <a className="primary-btn centered-btn" href="services.html">View all services <ArrowRight size={16}/></a>
    </section></Reveal>

    <Reveal><section className="home-section split-section">
      <div><span className="site-kicker">HOW WE WORK</span><h2>From requirement to execution.</h2></div>
      <div className="process-list"><div><b>01</b><span><strong>Understand</strong> We clarify the requirement, context and outcome.</span></div><div><b>02</b><span><strong>Coordinate</strong> We bring the relevant professional capabilities together.</span></div><div><b>03</b><span><strong>Execute</strong> We drive the work toward a clear, usable outcome.</span></div></div>
    </section></Reveal>

    <Reveal><section className="home-cta"><span className="site-kicker">READY WHEN YOU ARE</span><h2>Have something that needs to get done?</h2><p>Tell us what you are working through. We will help identify the right professional path.</p><a className="primary-btn light-btn" href="contact.html">Start a conversation <ArrowRight size={17}/></a></section></Reveal>
  </>
}

function About(){
  return <Page title="Professional expertise, coordinated around your requirement." kicker="ABOUT BRAINBANQUE">
    <section className="content-grid"><div><h2>Built for work that does not fit into one box.</h2></div><div><p>Businesses rarely have one isolated problem. A tax question can touch accounting. A corporate decision can involve legal and compliance work. An expansion can require finance, structuring and execution.</p><p>BrainBanque is designed around that reality — bringing the right professional capabilities together and coordinating the work from requirement to delivery.</p></div></section>
    <section className="dark-panel"><span className="site-kicker light">OUR APPROACH</span><h2>Professional depth without unnecessary complexity.</h2><div className="number-grid"><div><b>01</b><strong>Clarity</strong><p>Define the real requirement before recommending action.</p></div><div><b>02</b><strong>Coordination</strong><p>Connect the right discipline and people around the work.</p></div><div><b>03</b><strong>Execution</strong><p>Move from advice to practical completion.</p></div></div></section>
  </Page>
}

function Services(){
  return <Page title="Services built for the work behind the business." kicker="SERVICES"><div className="detail-service-grid">{services.map(([name,desc,Icon])=><article key={name}><div className="icon-box"><Icon/></div><h3>{name}</h3><p>{desc}</p><a href="contact.html">Discuss this service <ArrowRight size={15}/></a></article>)}</div></Page>
}

function Expertise(){
  const items=['Accounting & Finance','Taxation & GST','Audit & Assurance','Corporate & Secretarial','Legal Support','Business Advisory','Compliance & Outsourcing','Financial & Management Reporting'];
  return <Page title="Different disciplines. One coordinated approach." kicker="EXPERTISE"><div className="expertise-list">{items.map((x,i)=><div key={x}><b>{String(i+1).padStart(2,'0')}</b><h3>{x}</h3><ArrowRight size={17}/></div>)}</div></Page>
}

function HowWeWork(){
  return <Page title="A clear path from requirement to execution." kicker="HOW WE WORK"><div className="workflow">{[['Understand','We start with the requirement, context, constraints and intended outcome.'],['Scope','We identify the relevant professional disciplines, deliverables and responsibilities.'],['Coordinate','We connect the workstreams and maintain a clear line of ownership.'],['Execute','We focus on completion, communication and practical usability.'],['Review','We close the loop, capture next steps and identify continuing requirements.']].map(([t,d],i)=><article key={t}><span>0{i+1}</span><div><h3>{t}</h3><p>{d}</p></div></article>)}</div></Page>
}

function Contact(){
  const [form,setForm]=useState({name:'',email:'',phone:'',company:'',service:'',message:''})
  const [sent,setSent]=useState(false)
  const submit=async e=>{e.preventDefault();try{await api.submitEnquiry(form);setSent(true)}catch{setSent(true)}}
  return <Page title="Tell us what you need help with." kicker="CONTACT"><div className="contact-layout"><div className="contact-details"><h2>Let's identify the right path forward.</h2><a href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle/>9003060652</a><a href={email}><Mail/>Info@Brainbanque.in</a><p>For enquiries, advisory requirements and professional service support, reach us directly or submit the form.</p></div><form className="contact-form" onSubmit={submit}>{sent?<div className="success-box"><CheckCircle2 size={34}/><h3>Requirement received.</h3><p>Thank you. We will review the details and get back to you.</p></div>:<><label>Name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><div className="form-two"><label>Email<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><label>Phone<input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label></div><label>Company<input value={form.company} onChange={e=>setForm({...form,company:e.target.value})}/></label><label>Requirement<textarea required rows="5" value={form.message} onChange={e=>setForm({...form,message:e.target.value})}/></label><button className="primary-btn" type="submit">Send requirement <ArrowRight size={16}/></button></>}</form></div></Page>
}

function Page({title,kicker,children}){
  useEffect(()=>{document.title=`${kicker} | BrainBanque Global Solutions`;window.scrollTo(0,0)},[kicker])
  return <><Header/><main><section className="page-hero"><span className="site-kicker">{kicker}</span><h1>{title}</h1></section>{children}</main><Footer/></>
}

export default function Site({page='home'}){
  useEffect(()=>{document.title=page==='home'?'BrainBanque Global Solutions':'BrainBanque Global Solutions'},[page])
  useEffect(()=>{const els=document.querySelectorAll('.site-reveal');const ob=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');ob.unobserve(e.target)}}),{threshold:.08});els.forEach(e=>ob.observe(e));return()=>ob.disconnect()},[page])
  return <div className="visitor-site"><Header/><main>{page==='home'?<Home/>:page==='about'?<About/>:page==='services'?<Services/>:page==='expertise'?<Expertise/>:page==='how'?<HowWeWork/>:<Contact/>}</main><Footer/></div>
}
