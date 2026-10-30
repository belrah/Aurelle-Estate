import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  Menu,
  X,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Heart,
  Search,
  ChevronLeft,
  ChevronRight,
  Check,
  Grid2X2,
  Map,
  Building2,
  KeyRound,
  Trees,
  Sparkles,
  ArrowDown,
  Share2,
  ShieldCheck,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  articles,
  categories,
  image,
  photos,
  properties,
  services,
  siteConfig,
  type Property,
} from "./data";
import {
  agreementOpening,
  agreementPreamble,
  agreementTopics,
  agreementVersion,
  consentSchema,
  currency,
  enquirySchema,
  filterProperties,
  resolveProperty,
  type Filters,
} from "./logic";
import "./styles.css";
import { Arrow, ButtonLink, PageIntro } from "./components/Common";
import { useFocusTrap } from "./hooks/useFocusTrap";
import { AgentChat, AgentContactLinks } from "./components/AgentChat";
import {
  CompareButton,
  CompareProvider,
  CompareTray,
} from "./features/compare/CompareContext";
const ComparePage = React.lazy(() => import("./features/compare/ComparePage"));
const Mortgage = React.lazy(() => import("./pages/Mortgage"));

const nav = [
  ["Properties", "/properties"],
  ["Compare", "/compare"],
  ["About Us", "/about"],
  ["Agents", "/agents"],
  ["Mortgage", "/mortgage"],
  ["REED", "/reed"],
  ["Contact Us", "/contact"],
];
function readSavedSlugs(): string[] {
  try {
    const items: unknown = JSON.parse(
      localStorage.getItem("aurelle-saved") || "[]",
    );
    return Array.isArray(items)
      ? items.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}
function useSaved(slug: string) {
  const [saved, setSaved] = useState(() => readSavedSlugs().includes(slug));
  useEffect(() => {
    setSaved(readSavedSlugs().includes(slug));
  }, [slug]);
  return {
    saved,
    toggle: () => {
      try {
        const items = readSavedSlugs();
        localStorage.setItem(
          "aurelle-saved",
          JSON.stringify(
            saved ? items.filter((x) => x !== slug) : [...items, slug],
          ),
        );
        setSaved(!saved);
      } catch {
        setSaved(!saved);
      }
    },
  };
}
function PropertyCard({ property: p }: { property: Property }) {
  const { saved, toggle } = useSaved(p.slug);
  return (
    <article className="property-card">
      <div className="card-photo">
        <Link to={`/properties/${p.slug}`}>
          <img
            src={image(p.photo, 800)}
            alt={`${p.title}: illustrative ${p.type.toLowerCase()}`}
            loading="lazy"
          />
        </Link>
        <span className="pill">{p.category}</span>
        <button
          className={`save ${saved ? "selected" : ""}`}
          onClick={toggle}
          aria-label={`${saved ? "Unsave" : "Save"} ${p.title}`}
          aria-pressed={saved}
        >
          <Heart size={17} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="property-info">
        <p className="location">
          <MapPin size={13} />
          {p.location}
        </p>
        <Link to={`/properties/${p.slug}`}>
          <h3>
            {p.title}
            <Arrow />
          </h3>
        </Link>
        <p className="price">
          {currency(p.price)} <small>{p.period}</small>
        </p>
        <div className="specs">
          {p.beds > 0 && (
            <>
              <span>
                <BedDouble size={15} />
                {p.beds} beds
              </span>
              <span>
                <Bath size={15} />
                {p.baths} baths
              </span>
            </>
          )}
          <span>
            <Maximize size={14} />
            {p.area} m²
          </span>
        </div>
        <p className="sample-caption">Sample listing · {p.status}</p>
        <CompareButton property={p} />
      </div>
    </article>
  );
}
function ArticleCard({ article: a }: { article: (typeof articles)[number] }) {
  return (
    <article className="article-card">
      <Link to={`/reed/${a.slug}`}>
        <img
          src={image(a.photo, 800)}
          alt="Illustrative residential interior"
          loading="lazy"
        />
        <p className="eyebrow">
          {a.category} <span className="reading">4 MIN READ</span>
        </p>
        <h3>{a.title}</h3>
        <p>{a.excerpt}</p>
        <span className="text-link">
          Read the story <Arrow />
        </span>
      </Link>
      <small>Aurelle editorial · Sample article</small>
    </article>
  );
}
function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", f);
    return () => window.removeEventListener("scroll", f);
  }, []);
  useFocusTrap(open, ".menu-toggle, .mobile-nav a", () => setOpen(false));
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className={scrolled ? "scrolled" : ""}>
        <div className="header-inner">
          <Link to="/" className="brand" aria-label="Aurelle Estates home">
            <img
              src={`${import.meta.env.BASE_URL}images/aurelle-logo.png`}
              alt="Aurelle Estate"
            />
          </Link>
          <nav aria-label="Main navigation">
            {nav.map(([label, url]) => (
              <NavLink key={url} to={url}>
                {label}
              </NavLink>
            ))}
          </nav>
          <Link to="/agents/sign-up" className="button header-cta">
            Get Started
            <Arrow />
          </Link>
          <button
            className="menu-toggle icon-button"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      {open && (
        <div
          className="mobile-nav"
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          <nav aria-label="Mobile navigation">
            {nav.map(([label, url]) => (
              <Link key={url} to={url} onClick={() => setOpen(false)}>
                {label}
                <Arrow />
              </Link>
            ))}
            <Link to="/agents/sign-up" onClick={() => setOpen(false)}>
              Get Started
              <Arrow />
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="footer-top">
          <div>
            <p className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</p>
            <h2>
              A place to belong.
              <br />A team to guide you.
            </h2>
          </div>
          <ButtonLink to="/contact" light>
            Let’s talk about your next move
          </ButtonLink>
        </div>
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              AURELLE<span>ESTATES</span>
            </div>
            <p>
              Homes, land and stays,
              <br />
              curated with care.
            </p>
            <p className="fine">{siteConfig.address}</p>
          </div>
          <div>
            <h4>Explore</h4>
            {nav.map(([label, url]) => (
              <Link key={url} to={url}>
                {label}
              </Link>
            ))}
          </div>
          <div>
            <h4>With Aurelle</h4>
            <Link to="/services">Our services</Link>
            <Link to="/agents">Become an agent</Link>
            <Link to="/agents/sign-up">Agent registration</Link>
            <Link to="/agents/login">Agent login</Link>
            <Link to="/contact?type=Inspection">Book an inspection</Link>
          </div>
          <div>
            <h4>Stay connected</h4>
            <AgentContactLinks />
            <p className="fine">
              Speak with our team
              <br />
              on your preferred app.
            </p>
            <Link to="/reed">
              A little knowledge goes a long way <Arrow />
            </Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Aurelle Limited. All rights reserved.
          </span>
          <div>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms & Conditions</Link>
          </div>
          <span>
            Lagos, Nigeria <span className="orange">↗</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
function Home() {
  const [category, setCategory] = useState("For Sale");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("All property types");
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  return (
    <>
      <section className="hero">
        <div className="hero-media">
          <img
            className="hero-photo"
            src={image(photos[0], 2200)}
            alt="A sunlit living room opening into a green garden"
          />
          <div className="hero-shade" />
        </div>
        <div className="wrap hero-inner">
          <div className="hero-label">
            <span />
            THOUGHTFULLY CURATED. PERSONALLY YOURS.
          </div>
          <h1>
            Good spaces.
            <br />
            Better <em>living.</em>
          </h1>
          <p>
            A home for your everyday. Land for your tomorrow.
            <br />A stay to remember. Find your place with Aurelle.
          </p>
          <div className="hero-actions">
            <ButtonLink to="/properties">Explore Properties</ButtonLink>
            <Link to="/contact?type=Inspection" className="hero-secondary">
              Book an inspection <Arrow />
            </Link>
          </div>
          <div className="hero-bottom">
            <span>
              <MapPin size={15} /> ROOTED IN LAGOS. INSPIRED BY YOU.
            </span>
            <a href="#discover" aria-label="Discover properties below">
              <ArrowDown size={20} />
            </a>
            <span>
              01 <i /> 03
            </span>
          </div>
        </div>
        <div className="property-search">
          <div className="search-tabs">
            {categories.slice(1, 5).map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={c === category ? "active" : ""}
              >
                {c === "Short-Term Rentals" ? "Short Stays" : c}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigate(
                `/properties?${new URLSearchParams({ category, location: location.trim(), ...(propertyType !== "All property types" ? { type: propertyType } : {}) })}`,
              );
            }}
          >
            <label>
              <span>LOCATION</span>
              <div>
                <MapPin size={17} />
                <input
                  aria-label="Search location"
                  placeholder="Where would you like to live?"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </label>
            <label className="search-type">
              <span>PROPERTY TYPE</span>
              <select
                aria-label="Search property type"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
              >
                <option>All property types</option>
                <option>Apartment</option>
                <option>Detached house</option>
                <option>Terrace</option>
                <option>Land</option>
              </select>
            </label>
            <button className="button" type="submit">
              <Search size={17} />
              Find my space
              <Arrow />
            </button>
          </form>
        </div>
      </section>
      <section id="discover" className="section wrap featured">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              <span /> SPACES WITH SOMETHING SPECIAL
            </p>
            <h2>
              Considered homes.
              <br />
              <em>Extraordinary possibilities.</em>
            </h2>
          </div>
          <div>
            <p>More than a listing. A place to see yourself.</p>
            <Link className="text-link" to="/properties">
              View all properties <Arrow />
            </Link>
          </div>
        </div>
        <div className="property-grid">
          {[0, 1, 2].map((n) => (
            <PropertyCard
              key={properties[(index + n) % properties.length].slug}
              property={properties[(index + n) % properties.length]}
            />
          ))}
        </div>
        <div className="section-end">
          <span className="fine">
            A glimpse of what’s possible · Demonstration listings
          </span>
          <div className="carousel-controls">
            <button
              aria-label="Previous featured properties"
              onClick={() => setIndex((index + 5) % 6)}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              aria-label="Next featured properties"
              onClick={() => setIndex((index + 1) % 6)}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>
      <section className="story-band">
        <div className="wrap story-grid">
          <div className="story-image">
            <img
              src={image(photos[3], 1000)}
              alt="Warm, thoughtfully finished dining space"
              loading="lazy"
            />
            <div className="image-note">
              <span>THE AURELLE APPROACH</span>
              <p>
                Real estate.
                <br />
                With a human touch.
              </p>
            </div>
          </div>
          <div className="story-copy">
            <p className="eyebrow">
              <span /> A LITTLE MORE PERSONAL
            </p>
            <h2>
              Property is a place.
              <br />
              <em>Home is a feeling.</em>
            </h2>
            <p>
              We believe finding the right space should feel as good as living
              in it. That means listening first, understanding what matters to
              you, and bringing care to every step.
            </p>
            <p>
              From your first viewing to your next chapter, we’re here to make
              the journey feel considered, clear and entirely yours.
            </p>
            <ButtonLink to="/about">Get to know Aurelle</ButtonLink>
            <div className="values-row">
              <span>
                <ShieldCheck size={20} />
                Clarity at every step
              </span>
              <span>
                <Heart size={20} />
                Care in every detail
              </span>
            </div>
          </div>
        </div>
      </section>
      <section className="section wrap">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              <span /> WHATEVER YOUR NEXT CHAPTER
            </p>
            <h2>
              A little guidance.
              <br />
              <em>A world of possibilities.</em>
            </h2>
          </div>
          <Link className="text-link" to="/services">
            Discover our services <Arrow />
          </Link>
        </div>
        <div className="service-grid">
          {services.slice(0, 4).map((s, i) => (
            <Link
              to={`/contact?type=${encodeURIComponent(s[3])}`}
              className="service-item"
              key={s[0]}
            >
              <span className="service-number">0{i + 1}</span>
              {[<Building2 />, <KeyRound />, <Heart />, <Trees />][i]}
              <h3>{s[0]}</h3>
              <p>{s[2]}</p>
              <span className="text-link">
                Let’s explore <Arrow />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="neighbourhood">
        <div className="wrap neighbourhood-inner">
          <p className="eyebrow">A CITY OF POSSIBILITIES</p>
          <h2>
            Your Lagos.
            <br />
            <em>Your way of living.</em>
          </h2>
          <p>
            From the quiet streets of Ikoyi to the energy of Lekki,
            <br />
            find a neighbourhood that feels like you.
          </p>
          <div>
            {["Lekki", "Ikoyi", "Victoria Island", "Ajah", "Epe"].map((x) => (
              <Link
                key={x}
                to={`/properties?location=${encodeURIComponent(x)}`}
              >
                {x}
                <Arrow />
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="section wrap">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              <span /> REED · REAL ESTATE, EXPLAINED
            </p>
            <h2>
              Good decisions start
              <br />
              <em>with a little insight.</em>
            </h2>
          </div>
          <Link to="/reed" className="text-link">
            Visit REED <Arrow />
          </Link>
        </div>
        <div className="article-grid">
          {articles.slice(0, 3).map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </section>
      <section className="contact-strip wrap">
        <Sparkles />
        <p>Your next move deserves a thoughtful conversation.</p>
        <Link to="/contact" className="text-link">
          Let’s find your place <Arrow />
        </Link>
      </section>
    </>
  );
}
function Listings() {
  const [params] = useSearchParams();
  const [f, setF] = useState<Filters>({
    category: params.get("category") || "All properties",
    location: params.get("location") || "",
    type: params.get("type") || "",
  });
  const [view, setView] = useState("grid");
  useEffect(() => {
    setF({
      category: params.get("category") || "All properties",
      location: params.get("location") || "",
      type: params.get("type") || "",
    });
  }, [params]);
  const results = filterProperties(properties, f);
  const update = (key: keyof Filters, value: string | number | undefined) =>
    setF({ ...f, [key]: value });
  return (
    <>
      <PageIntro
        eyebrow="FIND YOUR PLACE"
        title="A space for every next chapter."
      >
        <p>
          Homes to settle into. Land to build on. Stays to slow down in.
          <br />
          Explore our demonstration collection and imagine the possibilities.
        </p>
      </PageIntro>
      <section className="wrap listing-section">
        <div className="category-tabs">
          {categories.map((c) => (
            <button
              key={c}
              className={f.category === c ? "active" : ""}
              onClick={() => update("category", c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="filters">
          <label>
            Location
            <input
              value={f.location || ""}
              placeholder="e.g. Lekki"
              onChange={(e) => update("location", e.target.value)}
            />
          </label>
          <label>
            Min price (₦)
            <input
              type="number"
              min="0"
              value={f.min ?? ""}
              onChange={(e) =>
                update(
                  "min",
                  e.target.value === "" ? undefined : +e.target.value,
                )
              }
            />
          </label>
          <label>
            Max price (₦)
            <input
              type="number"
              min="0"
              value={f.max ?? ""}
              onChange={(e) =>
                update(
                  "max",
                  e.target.value === "" ? undefined : +e.target.value,
                )
              }
            />
          </label>
          <label>
            Bedrooms
            <select
              aria-label="Bedrooms"
              value={f.beds || ""}
              onChange={(e) => update("beds", +e.target.value)}
            >
              <option value="">Any</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}+
                </option>
              ))}
            </select>
          </label>
          <label>
            Bathrooms
            <select
              aria-label="Bathrooms"
              value={f.baths || ""}
              onChange={(e) => update("baths", +e.target.value)}
            >
              <option value="">Any</option>
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n}+
                </option>
              ))}
            </select>
          </label>
          <label>
            Property type
            <select
              aria-label="Property type"
              value={f.type || ""}
              onChange={(e) => update("type", e.target.value)}
            >
              <option value="">All types</option>
              {["Apartment", "Detached house", "Terrace", "Land"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select
              aria-label="Status"
              value={f.status || ""}
              onChange={(e) => update("status", e.target.value)}
            >
              <option value="">Any status</option>
              {["Available", "Under Offer", "Sold", "Let"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="results-bar">
          <span role="status">
            {results.length} {results.length === 1 ? "space" : "spaces"} to
            explore <small> · Sample data</small>
          </span>
          <div>
            <button
              className="text-button"
              onClick={() => setF({ category: "All properties" })}
            >
              Clear filters
            </button>
            <button
              className={view === "grid" ? "view active" : "view"}
              aria-label="Grid view"
              onClick={() => setView("grid")}
            >
              <Grid2X2 size={17} />
            </button>
            <button
              className={view === "map" ? "view active" : "view"}
              aria-label="Map view"
              onClick={() => setView("map")}
            >
              <Map size={17} />
            </button>
          </div>
        </div>
        {view === "map" ? (
          <div className="empty-state">
            <Map size={36} />
            <h2>A map needs a little more detail.</h2>
            <p>
              Verified property coordinates and a map provider have not been
              configured. Explore the collection in grid view.
            </p>
            <button className="button" onClick={() => setView("grid")}>
              Back to the properties <Arrow />
            </button>
          </div>
        ) : results.length ? (
          <div className="property-grid">
            {results.map((p) => (
              <PropertyCard key={p.slug} property={p} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Search size={32} />
            <h2>No spaces match just yet.</h2>
            <p>
              Try a broader location, a different category or a wider price
              range.
            </p>
            <button
              className="button"
              onClick={() => setF({ category: "All properties" })}
            >
              Clear all filters
            </button>
          </div>
        )}
        <div className="notice">
          A considered starting point: all properties, prices and availability
          here are illustrative. Please enquire for verified options.
        </div>
      </section>
    </>
  );
}
function ShareButton() {
  const [status, setStatus] = useState("");
  return (
    <>
      <button
        className="outline-button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(window.location.href);
            setStatus("Link copied.");
          } catch {
            setStatus("Copy the address from your browser to share this page.");
          }
        }}
      >
        <Share2 size={16} />
        Share
      </button>
      <span className="fine" role="status">
        {status}
      </span>
    </>
  );
}
function PropertyDetail() {
  const { slug } = useParams();
  const p = resolveProperty(slug || "");
  const [photo, setPhoto] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [room, setRoom] = useState("Living room");
  const { saved, toggle } = useSaved(slug || "");
  useFocusTrap(lightbox, ".lightbox button", () => setLightbox(false));
  if (!p) return <NotFound />;
  const gallery = [p.photo, photos[0], photos[1]];
  return (
    <section className="wrap detail-section">
      <Link to="/properties" className="text-link">
        <ChevronLeft size={16} />
        Back to properties
      </Link>
      <div className="detail-heading">
        <div>
          <p className="eyebrow">{p.category} · SAMPLE LISTING</p>
          <h1>{p.title}</h1>
          <p className="location">
            <MapPin size={16} />
            {p.location}
          </p>
        </div>
        <div>
          <ShareButton />
          <CompareButton property={p} />
          <button
            className="outline-button"
            onClick={toggle}
            aria-pressed={saved}
          >
            <Heart size={16} fill={saved ? "currentColor" : "none"} />
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
      <div className="gallery">
        <button
          className="gallery-main"
          onClick={() => setLightbox(true)}
          aria-label="Open property image gallery"
        >
          <img
            src={image(gallery[photo])}
            alt={`${p.title} illustrative gallery image ${photo + 1}`}
          />
          <span>
            View gallery <Maximize size={16} />
          </span>
        </button>
        <div>
          {gallery.map((x, i) => (
            <button
              aria-label={`View image ${i + 1}`}
              key={i}
              onClick={() => setPhoto(i)}
              className={photo === i ? "selected" : ""}
            >
              <img
                src={image(x, 500)}
                alt={`Illustrative property view ${i + 1}`}
              />
            </button>
          ))}
        </div>
      </div>
      {lightbox && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Property image gallery"
        >
          <button
            className="close-lightbox"
            onClick={() => setLightbox(false)}
            aria-label="Close gallery"
          >
            <X />
          </button>
          <img
            src={image(gallery[photo], 1800)}
            alt={`${p.title} illustrative property view`}
          />
          <div>
            <button
              aria-label="Previous image"
              onClick={() => setPhoto((photo + 2) % 3)}
            >
              <ChevronLeft />
            </button>
            <span>{photo + 1} / 3</span>
            <button
              aria-label="Next image"
              onClick={() => setPhoto((photo + 1) % 3)}
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      )}
      <div className="detail-body">
        <div>
          <p className="eyebrow">A CLOSER LOOK</p>
          <h2>Room for your kind of living.</h2>
          <div className="detail-specs">
            <span>
              <Building2 />
              {p.type}
            </span>
            <span>
              <BedDouble />
              {p.beds} bedrooms
            </span>
            <span>
              <Bath />
              {p.baths} bathrooms
            </span>
            <span>
              <Maximize />
              {p.area} m²
            </span>
          </div>
          <p>
            A considered {p.type.toLowerCase()} concept in {p.location},
            designed around comfortable everyday living. Explore the
            illustrative gallery, make a note of your priorities and talk to our
            team about comparable verified options.
          </p>
          <p>
            This is a demonstration listing, not a confirmed offer. Finishes,
            amenities, dimensions, title and availability must be independently
            checked before any commitment.
          </p>
          <h3>The details that matter</h3>
          <div className="amenities">
            {(p.type === "Land"
              ? [
                  "Site access to be confirmed",
                  "Survey review required",
                  "Title checks required",
                  "Independent inspection recommended",
                ]
              : [
                  "Light-filled living spaces",
                  "Parking concept",
                  "Fitted kitchen concept",
                  "Outdoor space concept",
                  "Water supply to be confirmed",
                  "Power arrangements to be confirmed",
                ]
            ).map((x) => (
              <span key={x}>
                <Check size={16} />
                {x}
              </span>
            ))}
          </div>
          <a
            className="text-link"
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.location)}`}
            target="_blank"
            rel="noreferrer"
          >
            Explore the neighbourhood <Arrow />
          </a>
          <div className="tour">
            <p className="eyebrow">EXPLORE ROOM BY ROOM</p>
            <h3>Your 360° viewing experience.</h3>
            <div className="room-tabs">
              {["Living room", "Kitchen", "Primary bedroom"].map((x) => (
                <button
                  aria-pressed={room === x}
                  onClick={() => setRoom(x)}
                  key={x}
                >
                  {x}
                </button>
              ))}
            </div>
            <div className="empty-state compact">
              <Maximize />
              <h3>{room}: panorama coming soon</h3>
              <p>
                Genuine panoramic assets have not been supplied. Use the image
                gallery above while we prepare an immersive tour.
              </p>
            </div>
          </div>
        </div>
        <aside className="enquiry-card">
          <p className="eyebrow">YOUR NEXT CHAPTER</p>
          <h2>{currency(p.price)}</h2>
          <p>{p.period || "Indicative asking price"}</p>
          <span className="status-dot">{p.status} · Demonstration only</span>
          <ButtonLink
            to={`/contact?type=${encodeURIComponent(p.category === "For Rent" ? "Rental" : "Property purchase")}&property=${p.slug}`}
          >
            Enquire about this space
          </ButtonLink>
          <Link
            className="outline-button"
            to={`/contact?type=Inspection&property=${p.slug}`}
          >
            Book an inspection <Arrow />
          </Link>
          {p.category === "Airbnb Stays" && (
            <p className="notice">
              An external Airbnb listing has not been supplied. Enquire for
              confirmed booking details.
            </p>
          )}
          <p className="fine">
            A thoughtful conversation. No pressure.
            <br />
            No payments collected on this site.
          </p>
        </aside>
      </div>
      <div className="section">
        <div className="section-heading">
          <h2>A few more possibilities.</h2>
          <Link to="/properties" className="text-link">
            Explore all <Arrow />
          </Link>
        </div>
        <div className="property-grid">
          {properties
            .filter((x) => x.slug !== p.slug)
            .slice(0, 3)
            .map((x) => (
              <PropertyCard key={x.slug} property={x} />
            ))}
        </div>
      </div>
    </section>
  );
}
function About() {
  return (
    <>
      <PageIntro
        eyebrow="THE AURELLE WAY"
        title="Good people. Considered spaces."
      >
        <p>
          We’re a boutique real estate agency in Lagos, bringing a personal
          approach to homes, land and stays.
        </p>
      </PageIntro>
      <section className="wrap story-grid section about-story">
        <img
          className="wide-image"
          src={image(photos[1])}
          alt="A comfortable, light-filled apartment interior"
        />
        <div>
          <p className="eyebrow">HOMES, LAND AND STAYS, CURATED WITH CARE.</p>
          <h2>
            Every move has
            <br />
            <em>a story behind it.</em>
          </h2>
          <p>
            A first home. A growing family. A quieter street. A new possibility.
            We start by listening to the life behind the search, then help you
            take the next step with clarity.
          </p>
          <p>
            Aurelle Estates is the property brand of Aurelle Limited. Our
            purpose is simple: to make your property journey feel thoughtful,
            personal and transparent.
          </p>
          <ButtonLink to="/contact">Talk to our team</ButtonLink>
        </div>
      </section>
      <section className="ivory-section">
        <div className="wrap">
          <div className="section-heading">
            <h2>Care is in the details.</h2>
            <p>The principles that guide our work.</p>
          </div>
          <div className="three-grid">
            {[
              [
                "Our mission",
                "Help people explore homes, land and stays with clear information and considered support.",
              ],
              [
                "Our vision",
                "A property experience where every client feels heard, informed and comfortable asking questions.",
              ],
              [
                "Our values",
                "Listen carefully. Communicate honestly. Respect people’s time. Follow through on the details.",
              ],
            ].map(([t, d]) => (
              <div key={t}>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="wrap section">
        <p className="eyebrow">FROM FIRST CONVERSATION TO NEXT CHAPTER</p>
        <h2>A clearer journey.</h2>
        <div className="steps-row">
          {[
            "We listen to what matters",
            "We create a considered shortlist",
            "We arrange a closer look",
            "We help you plan your next step",
          ].map((t, i) => (
            <div key={t}>
              <span>0{i + 1}</span>
              <h3>{t}</h3>
            </div>
          ))}
        </div>
        <div className="section-heading team-heading">
          <div>
            <p className="eyebrow">THE PEOPLE BEHIND THE CARE</p>
            <h2>Meet the roles supporting your move.</h2>
          </div>
        </div>
        <div className="three-grid">
          {[
            "Client advisory lead",
            "Property operations lead",
            "Agent partnership lead",
          ].map((t) => (
            <div className="role-card" key={t}>
              <Building2 />
              <h3>{t}</h3>
              <p>
                Profile awaiting confirmation. Meet your assigned contact
                through an enquiry.
              </p>
            </div>
          ))}
        </div>
        <div className="notice">
          <MapPin size={20} />
          <p>{siteConfig.address}</p>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Lekki+Lagos"
            target="_blank"
            rel="noreferrer"
          >
            Explore Lekki ↗
          </a>
        </div>
      </section>
    </>
  );
}
function Services() {
  const icons = [
    <Building2 />,
    <KeyRound />,
    <Heart />,
    <Trees />,
    <Sparkles />,
    <ShieldCheck />,
    <MapPin />,
  ];
  return (
    <>
      <PageIntro
        eyebrow="A LITTLE SUPPORT. A BIG DIFFERENCE."
        title="Every property journey, thoughtfully supported."
      >
        <p>
          Whether you’re finding your place or caring for a property, let’s
          build a plan around what you need.
        </p>
      </PageIntro>
      <section className="wrap service-list">
        {services.map((s, i) => (
          <article key={s[0]}>
            <span className="service-number">0{i + 1}</span>
            <div className="service-icon">{icons[i]}</div>
            <div>
              <p className="eyebrow">{s[0]}</p>
              <h2>{s[1]}</h2>
              <p>{s[2]}</p>
            </div>
            <ButtonLink to={`/contact?type=${encodeURIComponent(s[3])}`}>
              Get started
            </ButtonLink>
          </article>
        ))}
      </section>
    </>
  );
}
function Reed() {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All stories");
  const cats = [
    "All stories",
    "Buying Guides",
    "Renting",
    "Land Ownership",
    "Investment",
    "Short-Term Letting",
    "Legal Basics",
    "Market Insights",
  ];
  const results = articles.filter(
    (a) =>
      (cat === "All stories" || a.category === cat) &&
      `${a.title} ${a.excerpt}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <PageIntro
        eyebrow="REED · REAL ESTATE EDUCATION"
        title="A little insight. A better next step."
      >
        <p>
          Thoughtful reads for buyers, renters, owners and the quietly curious.
          <br />
          Make sense of property, one story at a time.
        </p>
      </PageIntro>
      <section className="wrap section reed-section">
        <div className="editorial-feature">
          <img
            src={image(articles[0].photo)}
            alt="Calm, sunlit residential interior"
          />
          <div>
            <p className="eyebrow">THE CONSIDERED BUYER · SAMPLE FEATURE</p>
            <h2>{articles[0].title}</h2>
            <p>{articles[0].excerpt}</p>
            <ButtonLink to={`/reed/${articles[0].slug}`}>
              Read the story
            </ButtonLink>
          </div>
        </div>
        <label className="article-search">
          <Search size={20} />
          <input
            aria-label="Search articles"
            placeholder="What would you like to understand?"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <div className="category-tabs">
          {cats.map((c) => (
            <button
              key={c}
              className={cat === c ? "active" : ""}
              onClick={() => setCat(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <p role="status" className="fine">
          {results.length} sample stories
        </p>
        <div className="article-grid">
          {results.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
        {!results.length && (
          <div className="empty-state">
            <h2>A story still to be written.</h2>
            <p>Try another search or explore a different topic.</p>
            <button
              className="button"
              onClick={() => {
                setSearch("");
                setCat("All stories");
              }}
            >
              Explore all stories
            </button>
          </div>
        )}
      </section>
    </>
  );
}
function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  return (
    <form
      className="newsletter"
      onSubmit={(e) => {
        e.preventDefault();
        setStatus(
          z.email().safeParse(email).success
            ? "Your email is valid. Newsletter signup is not connected yet; no subscription has been saved."
            : "Enter a valid email address.",
        );
      }}
    >
      <p className="eyebrow">A LITTLE INSIGHT IN YOUR INBOX</p>
      <h3>Stay curious.</h3>
      <p>
        Property perspectives, thoughtfully shared. Newsletter service coming
        soon.
      </p>
      <label>
        Email address
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <button className="button">
        Check email <Arrow />
      </button>
      <p role="status">{status}</p>
    </form>
  );
}
function Article() {
  const { slug } = useParams();
  const a = articles.find((x) => x.slug === slug);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const f = () =>
      setProgress(
        (window.scrollY /
          Math.max(
            1,
            document.documentElement.scrollHeight - window.innerHeight,
          )) *
          100,
      );
    window.addEventListener("scroll", f);
    return () => window.removeEventListener("scroll", f);
  }, []);
  if (!a) return <NotFound />;
  return (
    <>
      <div className="reading-progress" style={{ width: `${progress}%` }} />
      <section className="wrap article-detail">
        <Link className="text-link" to="/reed">
          <ChevronLeft size={16} />
          Back to REED
        </Link>
        <PageIntro eyebrow={`${a.category} · 4 MIN READ`} title={a.title}>
          <p>
            Aurelle editorial · Sample educational content · 29 October 2026
          </p>
          <ShareButton />
        </PageIntro>
        <img
          className="article-cover"
          src={image(a.photo)}
          alt="Illustrative residential interior"
        />
        <div className="article-body">
          <aside>
            <p className="eyebrow">IN THIS STORY</p>
            {a.sections.map(([t], i) => (
              <a key={t} href={`#section-${i}`}>
                {t}
              </a>
            ))}
          </aside>
          <div>
            <p className="article-lede">{a.excerpt}</p>
            {a.sections.map(([t, b], i) => (
              <section id={`section-${i}`} key={t}>
                <h2>{t}</h2>
                <p>{b}</p>
              </section>
            ))}
            <div className="notice">
              Sample editorial content for general education. Verify details
              with relevant qualified professionals before making a property,
              legal or financial decision.
            </div>
            <Newsletter />
          </div>
        </div>
        <div className="section">
          <h2>A little more to explore.</h2>
          <div className="article-grid">
            {articles
              .filter((x) => x.slug !== slug)
              .slice(0, 3)
              .map((x) => (
                <ArticleCard key={x.slug} article={x} />
              ))}
          </div>
        </div>
      </section>
    </>
  );
}
type EnquiryValues = z.infer<typeof enquirySchema>;
function EnquiryForm() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [inspectionDate, setInspectionDate] = useState("");
  const [inspectionTime, setInspectionTime] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EnquiryValues>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      type: params.get("type") || "General enquiry",
      message: params.get("property")
        ? `I would like to learn more about ${params.get("property")?.replaceAll("-", " ")}.`
        : "",
      method: "Email",
    },
  });
  const submit = async (data: EnquiryValues) => {
    if (busy) return;
    if (
      data.type === "Inspection" &&
      (!inspectionDate ||
        !inspectionTime ||
        new Date(inspectionDate + "T23:59:59+01:00").getTime() < Date.now())
    ) {
      setStatus("Choose a future inspection date and your preferred time.");
      return;
    }
    if (data.type === "Inspection") {
      data.preferredDate = inspectionDate;
      data.preferredTime = inspectionTime;
    }
    setBusy(true);
    setStatus("");
    const endpoint = import.meta.env.VITE_ENQUIRY_ENDPOINT;
    if (!endpoint) {
      setStatus(
        "Your enquiry is ready, but delivery is not connected. Nothing has been sent or saved. Please return when verified contact details are available.",
      );
      setBusy(false);
      return;
    }
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error();
      setStatus("The configured enquiry service accepted your request.");
    } catch {
      setStatus("Your enquiry could not be delivered. Please try again later.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="enquiry-form" onSubmit={handleSubmit(submit)} noValidate>
      <div className="form-grid">
        {(
          [
            ["name", "Your name", "text"],
            ["email", "Email address", "email"],
            ["phone", "Phone number", "tel"],
          ] as const
        ).map(([k, t, type]) => (
          <label key={k}>
            {t}
            <input
              aria-label={t}
              type={type}
              {...register(k)}
              aria-invalid={!!errors[k]}
              autoComplete={
                k === "name" ? "name" : k === "email" ? "email" : "tel"
              }
            />
            {errors[k] && (
              <span className="error" role="alert">
                {errors[k]?.message}
              </span>
            )}
          </label>
        ))}
        <label>
          I’m interested in
          <select {...register("type")}>
            {[
              "Property purchase",
              "Rental",
              "Land",
              "Short-stay",
              "Property management",
              "Mortgage",
              "Agent registration",
              "General enquiry",
              "Inspection",
            ].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        {watch("type") === "Inspection" && (
          <>
            <label>
              Preferred inspection date
              <input
                type="date"
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
              />
            </label>
            <label>
              Preferred inspection time
              <input
                type="time"
                value={inspectionTime}
                onChange={(e) => setInspectionTime(e.target.value)}
              />
            </label>
          </>
        )}
        <label className="full-width">
          Tell us a little more
          <textarea
            aria-label="Tell us a little more"
            rows={5}
            {...register("message")}
            aria-invalid={!!errors.message}
            placeholder="Your ideal space, preferred location, budget or a question you have…"
          />
          {errors.message && (
            <span className="error" role="alert">
              {errors.message.message}
            </span>
          )}
        </label>
        <label className="full-width">
          How would you prefer us to contact you?
          <select {...register("method")}>
            <option>Email</option>
            <option>Phone</option>
            <option>WhatsApp</option>
          </select>
        </label>
      </div>
      <p className="fine">
        By preparing an enquiry, you acknowledge our{" "}
        <Link to="/privacy">Privacy Policy</Link>. Delivery is unavailable in
        demonstration mode.
      </p>
      <button disabled={busy} className="button">
        {busy ? "Sending…" : "Prepare enquiry"}
        <Arrow />
      </button>
      <p role="status" className={status ? "form-status" : ""}>
        {status}
      </p>
    </form>
  );
}
function Contact() {
  const [params] = useSearchParams();
  return (
    <>
      <PageIntro
        eyebrow="LET’S START WITH A CONVERSATION"
        title="Tell us about your next chapter."
      >
        <p>
          A question, a viewing or the beginning of a search.
          <br />
          We’re here to help you make sense of your next move.
        </p>
      </PageIntro>
      <section className="wrap contact-layout">
        <div>
          <h2>A little about you.</h2>
          <EnquiryForm
            key={`${params.get("type") || ""}:${params.get("property") || ""}`}
          />
        </div>
        <aside>
          <p className="eyebrow">FIND US IN LAGOS</p>
          <h2>A personal welcome.</h2>
          <p>
            <MapPin size={20} />
          </p>
          <p>{siteConfig.address}</p>
          <a
            className="text-link"
            href="https://www.google.com/maps/search/?api=1&query=Lekki+Lagos"
            target="_blank"
            rel="noreferrer"
          >
            Explore the area <Arrow />
          </a>
          <hr />
          <h3>Let’s find a time.</h3>
          <p>
            Office opening hours awaiting confirmation. Share your preferred
            contact time in your enquiry.
          </p>
          <hr />
          <h3>
            {params.get("channel")
              ? `${params.get("channel")} enquiries`
              : "Prefer a quick conversation?"}
          </h3>
          <p>
            Chat with our team on WhatsApp or Telegram at +234 810 218 0628, or
            find us on Instagram at @belhrah.
          </p>
          <div className="contact-social-links">
            <AgentContactLinks />
          </div>
          <div className="notice">
            Demonstration mode: enquiries are validated locally. No message is
            sent without a configured delivery service.
          </div>
        </aside>
      </section>
    </>
  );
}
function Agreement({ applicantName }: { applicantName?: string }) {
  return (
    <div
      className="agreement"
      tabIndex={0}
      role="region"
      aria-label="Agency agreement terms and conditions"
    >
      <p className="eyebrow">AGENCY AGREEMENT · {agreementVersion}</p>
      <h3>
        Draft — subject to review and approval by qualified Nigerian legal
        counsel.
      </h3>
      <p>{agreementOpening}</p>
      <p className="agreement-preamble">
        {applicantName
          ? agreementPreamble
              .replace("(Applying Agent)", applicantName)
              .replace("(Agent)", applicantName)
          : agreementPreamble}
      </p>
      {agreementTopics.map(([title, body], i) => (
        <section key={title}>
          <h4>
            {i + 1}. {title}
          </h4>
          <p>{body}</p>
        </section>
      ))}
    </div>
  );
}
function Agents() {
  return (
    <>
      <section className="agent-hero">
        <div className="wrap agent-hero-grid">
          <div>
            <p className="eyebrow">
              <span />
              FOR REAL ESTATE AGENTS
            </p>
            <h1>
              Your local knowledge.
              <br />
              <em>Our next chapter.</em>
            </h1>
            <p>
              Build meaningful client relationships with Aurelle. If you work in
              sales, lettings, land or short stays, bring your expertise to a
              partnership shaped by care and clear expectations.
            </p>
            <div className="agent-hero-actions">
              <a href="#agent-application" className="button light">
                Sign up as an agent <Arrow />
              </a>
              <a className="text-link" href="#agreement">
                Read the agency agreement <ArrowDown size={16} />
              </a>
            </div>
            <p className="agent-hero-note">
              For independent real estate professionals. Applications are
              reviewed before appointment.
            </p>
          </div>
          <div className="agent-hero-image">
            <img
              src={image(photos[2], 1100)}
              alt="Contemporary residential architecture, illustrating the spaces our agents help clients explore"
            />
            <span>GOOD RELATIONSHIPS. GREATER POSSIBILITIES.</span>
          </div>
        </div>
      </section>
      <section className="wrap section" aria-labelledby="agent-benefits">
        <div className="section-heading">
          <h2 id="agent-benefits">
            Independent ambition.
            <br />
            <em>Shared standards.</em>
          </h2>
          <p>
            Why partner with Aurelle?
            <br />A shared approach to considered service.
          </p>
        </div>
        <div className="three-grid">
          {[
            [
              "A shared approach",
              "Work with a property brand that values listening, clear communication and attention to detail.",
            ],
            [
              "Space to grow",
              "Discuss your specialisation, areas served and the support you need to develop your practice.",
            ],
            [
              "Clear commercial terms",
              "Commission structures are indicative until approved. No final rate is published; terms must be agreed in writing.",
            ],
          ].map(([t, b]) => (
            <div key={t}>
              <ShieldCheck className="orange" />
              <h3>{t}</h3>
              <p>{b}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="ivory-section" aria-labelledby="agent-process">
        <div className="wrap">
          <p className="eyebrow">
            <span />A THOUGHTFUL START
          </p>
          <h2 id="agent-process">
            From introduction
            <br />
            <em>to partnership.</em>
          </h2>
          <p>
            Prepare your profile, understand the expectations and take the next
            step with clarity.
          </p>
          <div className="steps-row">
            {[
              [
                "Introduce yourself",
                "Share your contact details, areas served and the experience you bring.",
              ],
              [
                "Define your focus",
                "Tell us your specialisation and the kind of clients and properties you work with.",
              ],
              [
                "Read the agreement",
                "Review the relationship, duties, commission, indemnification and termination sections.",
              ],
              [
                "Complete your application",
                "Confirm your consent and submit for review when secure applications become available.",
              ],
            ].map(([title, body], i) => (
              <div key={title}>
                <span>0{i + 1}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
          <a href="#agent-application" className="text-link">
            Ready to introduce yourself? <Arrow />
          </a>
        </div>
      </section>
      <section
        className="wrap section agent-agreement-section"
        id="agreement"
        aria-labelledby="agreement-heading"
      >
        <p className="eyebrow">
          <span />
          AGENCY AGREEMENT
        </p>
        <h2 id="agreement-heading">Start with clear expectations.</h2>
        <p>{agreementOpening}</p>
        <Agreement />
        <a href="#agent-application" className="button">
          Continue to agent signup <Arrow />
        </a>
      </section>
      <AgentSignup embedded />
    </>
  );
}
const wizardSteps = [
  "Personal details",
  "Professional details",
  "Documents & banking",
  "Agency agreement",
];
const personal = z.object({
  fullName: z.string().min(2, "Enter your full name."),
  email: z.email("Enter a valid email."),
  phone: enquirySchema.shape.phone,
  whatsapp: enquirySchema.shape.phone,
  address: z.string().min(8, "Enter your residential address."),
  dob: z.string().refine((v) => {
    const d = new Date(v);
    const age = (Date.now() - d.getTime()) / 31557600000;
    return Number.isFinite(age) && age >= 18 && age < 120;
  }, "Applicants must be at least 18 years old."),
});
const professional = z.object({
  business: z.string(),
  experience: z.coerce.number().min(0).max(70),
  specialisation: z.string().min(1, "Choose a specialisation."),
  licence: z.string(),
  areas: z.string().min(2, "Enter the areas you serve."),
  bio: z.string().min(20, "Please include at least 20 characters."),
});
function AgentSignup({ embedded = false }: { embedded?: boolean }) {
  const [step, setStep] = useState(0);
  const [fields, setFields] = useState<Record<string, string>>({
    experience: "0",
    fullName: "",
    email: "",
    phone: "",
    whatsapp: "",
    address: "",
    dob: "",
    business: "",
    specialisation: "",
    licence: "",
    areas: "",
    bio: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState("");
  const [files, setFiles] = useState<Record<string, string>>({});
  const change = (k: string, v: string) => setFields({ ...fields, [k]: v });
  const validate = () => {
    if (step === 0 && files.photo?.startsWith("Error")) {
      setErrors({ documents: "Please replace the invalid profile photo." });
      return false;
    }
    const result =
      step === 0
        ? personal.safeParse(fields)
        : step === 1
          ? professional.safeParse(fields)
          : null;
    if (result && !result.success) {
      setErrors(
        Object.fromEntries(
          result.error.issues.map((x) => [String(x.path[0]), x.message]),
        ),
      );
      return false;
    }
    if (step === 2 && Object.values(files).some((x) => x.startsWith("Error"))) {
      setErrors({ documents: "Please remove or replace invalid files." });
      return false;
    }
    setErrors({});
    return true;
  };
  const field = (
    key: string,
    label: string,
    type = "text",
    required = true,
  ) => (
    <label key={key}>
      {label}
      {!required && <small> (optional)</small>}
      <input
        aria-label={label}
        type={type}
        value={fields[key] || ""}
        onChange={(e) => change(key, e.target.value)}
        aria-invalid={!!errors[key]}
      />
      {errors[key] && (
        <span role="alert" className="error">
          {errors[key]}
        </span>
      )}
    </label>
  );
  return (
    <>
      {!embedded && (
        <PageIntro
          eyebrow="YOUR AURELLE JOURNEY"
          title="Let’s get to know you."
        >
          <p>
            A few details to start a considered partnership.
            <br />
            Demonstration application — personal data stays in this page’s
            memory.
          </p>
        </PageIntro>
      )}
      <section
        className={`wrap wizard ${embedded ? "embedded-application" : ""}`}
        id={embedded ? "agent-application" : undefined}
        aria-label="Agent signup form"
      >
        {embedded && (
          <div className="application-intro">
            <p className="eyebrow">
              <span />
              AGENT SIGNUP
            </p>
            <h2>Let’s get to know you.</h2>
            <p>
              A detailed, four-step introduction for prospective Aurelle agents.
              Your progress stays on this page as you move between steps.
            </p>
            <p className="fine">
              Demonstration mode: secure application delivery is not configured.
              No application data or documents are sent or saved.
            </p>
          </div>
        )}
        <ol className="wizard-progress">
          {wizardSteps.map((t, i) => (
            <li
              className={i === step ? "active" : i < step ? "done" : ""}
              key={t}
            >
              <span>{i < step ? <Check size={16} /> : i + 1}</span>
              {t}
            </li>
          ))}
        </ol>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (step < 3) {
              if (validate()) setStep(step + 1);
            } else if (!consentSchema.safeParse(consent).success) {
              setErrors({
                consent: "Please confirm you have read the draft agreement.",
              });
            } else {
              setErrors({});
              setStatus(
                "Demo review complete. No application, documents, banking details or agreement consent have been submitted or saved. A secure application service must be configured before a reference can be issued.",
              );
            }
          }}
          noValidate
        >
          <p className="eyebrow">STEP {step + 1} OF 4</p>
          <h2>{wizardSteps[step]}</h2>
          {step === 0 && (
            <div className="form-grid">
              {field("fullName", "Full name")}
              {field("email", "Email address", "email")}
              {field("phone", "Phone number", "tel")}
              {field("whatsapp", "WhatsApp number", "tel")}
              {field("address", "Residential address")}
              {field("dob", "Date of birth", "date")}
              <label className="full-width">
                Profile photo (optional)
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setFiles({
                      ...files,
                      photo: f
                        ? f.size > 5 * 1024 * 1024 ||
                          !["image/jpeg", "image/png", "image/webp"].includes(
                            f.type,
                          )
                          ? "Error: choose a JPG, PNG or WebP up to 5 MB."
                          : `${f.name} selected locally; not uploaded.`
                        : "",
                    });
                  }}
                />
                <span className="fine" role="status">
                  {files.photo}
                </span>
              </label>
            </div>
          )}
          {step === 1 && (
            <div className="form-grid">
              {field("business", "Agency or business name", "text", false)}
              {field("experience", "Years of experience", "number")}
              <label>
                Specialisation
                <select
                  value={fields.specialisation || ""}
                  onChange={(e) => change("specialisation", e.target.value)}
                >
                  <option value="">Choose an area</option>
                  {[
                    "Sales",
                    "Lettings",
                    "Land",
                    "Short-stay",
                    "Property management",
                  ].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
                {errors.specialisation && (
                  <span role="alert" className="error">
                    {errors.specialisation}
                  </span>
                )}
              </label>
              {field(
                "licence",
                "Professional registration number",
                "text",
                false,
              )}
              {field("areas", "Areas served")}
              <label className="full-width">
                Short bio
                <textarea
                  value={fields.bio || ""}
                  onChange={(e) => change("bio", e.target.value)}
                  rows={4}
                />
                {errors.bio && (
                  <span role="alert" className="error">
                    {errors.bio}
                  </span>
                )}
              </label>
            </div>
          )}
          {step === 2 && (
            <>
              <div className="notice">
                Secure document and banking storage is not configured. Document
                selections are checked locally and never uploaded. Sensitive
                banking and BVN fields are disabled; do not enter real financial
                information.
              </div>
              <div className="form-grid">
                {["Identity document", "Proof of registration"].map((t, i) => (
                  <label key={t}>
                    {t} (optional in demo)
                    <input
                      type="file"
                      accept="application/pdf,image/jpeg,image/png"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        setFiles({
                          ...files,
                          [i]: f
                            ? f.size > 5 * 1024 * 1024 ||
                              ![
                                "application/pdf",
                                "image/jpeg",
                                "image/png",
                              ].includes(f.type)
                              ? "Error: use a PDF, JPG or PNG up to 5 MB."
                              : `${f.name} selected locally; not uploaded.`
                            : "",
                        });
                      }}
                    />
                    <span role="status" className="fine">
                      {files[i]}
                    </span>
                  </label>
                ))}
                {[
                  "Bank name",
                  "Account name",
                  "Account number",
                  "BVN — sensitive",
                ].map((t) => (
                  <label key={t}>
                    {t}
                    <input
                      disabled
                      type={t.includes("BVN") ? "password" : "text"}
                      placeholder="Unavailable in demo mode"
                    />
                  </label>
                ))}
              </div>
              {errors.documents && (
                <p className="error" role="alert">
                  {errors.documents}
                </p>
              )}
            </>
          )}
          {step === 3 && (
            <>
              <Agreement applicantName={fields.fullName} />
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                I have read and agree to the agency agreement terms and
                conditions ({agreementVersion}). I understand the agreement is a
                draft and this is a demonstration application.
              </label>
              {errors.consent && (
                <p role="alert" className="error">
                  {errors.consent}
                </p>
              )}
            </>
          )}
          <div className="wizard-buttons">
            {step > 0 && (
              <button
                type="button"
                className="outline-button"
                onClick={() => {
                  setStep(step - 1);
                  setErrors({});
                }}
              >
                Back
              </button>
            )}
            <button className="button">
              {step < 3 ? "Next step" : "Submit Application"}
              <Arrow />
            </button>
          </div>
          <p role="status" className={status ? "form-status" : ""}>
            {status}
          </p>
        </form>
      </section>
    </>
  );
}
function AgentLogin() {
  const [status, setStatus] = useState("");
  return (
    <>
      <PageIntro
        eyebrow="YOUR AURELLE PARTNERSHIP"
        title="A familiar place to return to."
      >
        <p>
          Agent access will be available once secure authentication is
          configured.
        </p>
      </PageIntro>
      <section className="narrow wrap login-panel">
        <h2>Agent login</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setStatus(
              "Secure agent authentication is not connected. No credentials were sent.",
            );
          }}
        >
          <label>
            Email address
            <input required type="email" autoComplete="username" />
          </label>
          <label>
            Password
            <input
              required
              type="password"
              autoComplete="current-password"
              minLength={8}
            />
          </label>
          <button className="button">
            Sign in <Arrow />
          </button>
          <p role="status">{status}</p>
        </form>
        <Link className="text-link" to="/agents/sign-up">
          New here? Explore agent registration <Arrow />
        </Link>
        <p className="fine">
          Use demonstration credentials only. For access questions,{" "}
          <Link to="/contact?type=Agent%20registration">
            prepare an enquiry
          </Link>
          .
        </p>
      </section>
    </>
  );
}
function Legal({ type }: { type: "privacy" | "terms" }) {
  const privacy = type === "privacy";
  const sections = privacy
    ? [
        [
          "What this demonstration collects",
          "Property saves, comparison shortlists and your comparison estimates and notes are stored in your browser. Comparison links share listing choices only; downloaded CSV files include your notes and estimates. Search and filter choices remain local. Form entries remain in page memory unless a configured enquiry endpoint is used. No identity documents or banking details are uploaded in demonstration mode.",
        ],
        [
          "How enquiries are handled",
          "If a delivery endpoint is configured by the operator, the submitted contact details and message are transmitted to that service. Its retention and processing practices must be reviewed before launch. Do not include financial or identity details in enquiries.",
        ],
        [
          "Photography and external links",
          "Illustrative photography is loaded from Unsplash. Opening external map links connects you to Google Maps. Chat links open WhatsApp, Instagram or Telegram. WhatsApp and Telegram receive the prepared message in the link when opened; you review and send it in the app. The copy control places the prepared message on your device clipboard for pasting into Instagram. Chat drafts are held in page memory, not submitted to an Aurelle inbox. External services apply their own policies.",
        ],
        [
          "Your choices",
          "You can remove saved properties with the save control or clear browser storage. Closing or reloading the page clears unsubmitted form state. Contact the operator through verified channels once published to discuss data requests.",
        ],
        [
          "Before public launch",
          "The operator must confirm the responsible entity, privacy contact, lawful processing basis, retention schedule and relevant rights processes. This draft requires review before live collection.",
        ],
      ]
    : [
        [
          "About this website",
          "Aurelle Estates is the property brand of Aurelle Limited. This website currently presents a demonstration collection, educational content and draft enquiry workflows.",
        ],
        [
          "Property information",
          "Sample prices, images, dimensions, descriptions and availability are illustrative. They do not constitute an offer. Verify the property, title, condition and commercial terms with appropriate professionals before payment.",
        ],
        [
          "Education and estimates",
          "REED articles provide general educational material. Mortgage calculations assume fixed rates and do not constitute approval, financial advice or a confirmed lending offer.",
        ],
        [
          "Agent partnerships",
          "The agency agreement is a draft preview. Commission rates and binding terms are not established by this website. Applications require a configured secure service and review; there is no automatic approval.",
        ],
        [
          "External services and availability",
          "Third-party links and services have separate terms. Some features remain unavailable until verified business information and integration configuration are provided. No payment facility is offered here.",
        ],
        [
          "Review before launch",
          "These draft terms require review by qualified Nigerian legal counsel and approval by the operator before production use.",
        ],
      ];
  return (
    <>
      <PageIntro
        eyebrow="CLEAR INFORMATION, THOUGHTFULLY SHARED"
        title={privacy ? "Privacy Policy" : "Terms & Conditions"}
      >
        <p>
          Draft for review · Updated 29 October 2026
          <br />
          Aurelle Limited · Lagos, Nigeria
        </p>
      </PageIntro>
      <article className="narrow wrap legal-copy">
        {sections.map(([t, b]) => (
          <section key={t}>
            <h2>{t}</h2>
            <p>{b}</p>
          </section>
        ))}
        <ButtonLink to="/contact">Discuss a question with us</ButtonLink>
      </article>
    </>
  );
}
function NotFound() {
  return (
    <section className="wrap empty-state not-found">
      <p className="eyebrow">404 · A DIFFERENT DIRECTION</p>
      <h1>Let’s find your way home.</h1>
      <p>This page isn’t in our collection. There’s plenty more to explore.</p>
      <ButtonLink to="/">Back to home</ButtonLink>
      <Link to="/properties" className="text-link">
        Explore properties <Arrow />
      </Link>
    </section>
  );
}
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="empty-state">
        <h1>Let’s try that again.</h1>
        <p>This page had trouble loading.</p>
        <a className="button" href={import.meta.env.BASE_URL}>
          Return home
        </a>
      </div>
    ) : (
      this.props.children
    );
  }
}
function Metadata() {
  const { pathname } = useLocation();
  useEffect(() => {
    const names: Record<string, string> = {
      "/": "Homes, land and stays",
      "/properties": "Find your space",
      "/compare": "Compare homes and land",
      "/about": "Our story",
      "/mortgage": "Understanding your mortgage",
      "/reed": "Real estate, explained",
      "/contact": "Let’s talk",
      "/services": "Our services",
      "/agents": "Grow with Aurelle",
      "/agents/sign-up": "Agent registration",
      "/agents/login": "Agent login",
      "/privacy": "Privacy Policy",
      "/terms": "Terms & Conditions",
    };
    const detail =
      properties.find((p) => pathname === `/properties/${p.slug}`)?.title ||
      articles.find((a) => pathname === `/reed/${a.slug}`)?.title;
    document.title = `${detail || names[pathname] || "Find your way home"} | Aurelle Estates`;
    const description = `${detail || names[pathname] || "Aurelle Estates"}. Homes, land and stays, curated with care in Lagos. Demonstration website.`;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", description);
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute("content", document.title);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute("content", description);
    const origin =
      window.location.origin + import.meta.env.BASE_URL.replace(/\/$/, "");
    let canonical = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.append(canonical);
    }
    canonical.href = origin + pathname;
  }, [pathname]);
  return null;
}
export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <CompareProvider>
        <ErrorBoundary>
          <Metadata />
          <Header />
          <main id="main">
            <React.Suspense
              fallback={
                <div className="wrap section" role="status">
                  Preparing your next chapter…
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/properties" element={<Listings />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/properties/:slug" element={<PropertyDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/mortgage" element={<Mortgage />} />
                <Route path="/reed" element={<Reed />} />
                <Route path="/reed/:slug" element={<Article />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/services" element={<Services />} />
                <Route path="/agents" element={<Agents />} />
                <Route path="/agents/sign-up" element={<AgentSignup />} />
                <Route path="/agents/login" element={<AgentLogin />} />
                <Route path="/privacy" element={<Legal type="privacy" />} />
                <Route path="/terms" element={<Legal type="terms" />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </React.Suspense>
          </main>
          <Footer />
          <AgentChat />
          <CompareTray />
        </ErrorBoundary>
      </CompareProvider>
    </BrowserRouter>
  );
}
