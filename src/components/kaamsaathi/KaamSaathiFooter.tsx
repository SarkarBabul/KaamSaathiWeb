import { Link } from "react-router-dom";
import { Mail, Phone, MessageCircle } from "lucide-react";
import logoTextImg from "../../assets/Logo(Text).png";

export function KaamSaathiFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <style>{footerStyles}</style>
      <footer className="ks-footer">
        <div className="ks-footer-inner">
          {/* Brand */}
          <div className="ks-footer-brand">
            <div className="ks-footer-logo">
              <img src={logoTextImg} alt="KaamSaathi" className="ks-footer-logo-text" />
            </div>
            <p className="ks-footer-tagline">
              Simple daily wage worker attendance management for contractors, small businesses, and field teams.
            </p>
            <p className="ks-footer-kamet">
              A product by{" "}
              <Link to="/kamet" className="ks-footer-kamet-link">Kamet</Link>
            </p>
          </div>

          {/* Quick Links */}
          <div className="ks-footer-col">
            <h4 className="ks-footer-col-title">Quick Links</h4>
            <ul className="ks-footer-list">
              <li><Link to="/" className="ks-footer-link">Home</Link></li>
              <li><Link to="/features" className="ks-footer-link">Features</Link></li>
              <li><Link to="/pricing" className="ks-footer-link">Pricing</Link></li>
              <li><Link to="/faq" className="ks-footer-link">FAQ &amp; Support</Link></li>
              <li><Link to="/blog" className="ks-footer-link">Blog</Link></li>
            </ul>
          </div>

          {/* Solutions */}
          <div className="ks-footer-col">
            <h4 className="ks-footer-col-title">Solutions</h4>
            <ul className="ks-footer-list">
              <li><Link to="/worker-attendance-app" className="ks-footer-link">Worker Attendance App</Link></li>
              <li><Link to="/labour-management-app" className="ks-footer-link">Labour Management App</Link></li>
              <li><Link to="/contractor-attendance-app" className="ks-footer-link">Contractor Attendance App</Link></li>
              <li><Link to="/mazdoor-hajri-app" className="ks-footer-link">Mazdoor Hajri App</Link></li>
              <li><Link to="/construction-site-management" className="ks-footer-link">Construction Site Management</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="ks-footer-col">
            <h4 className="ks-footer-col-title">Contact Us</h4>
            <ul className="ks-footer-list">
              <li className="ks-footer-contact-item">
                <Mail size={14} className="ks-footer-contact-icon" />
                <span>info@kametgroup.com</span>
              </li>
              <li className="ks-footer-contact-item">
                <Phone size={14} className="ks-footer-contact-icon" />
                <span>+91 9997394773</span>
              </li>
              <li>
                <a
                  href="https://wa.me/919997394773"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ks-footer-whatsapp"
                >
                  <MessageCircle size={14} />
                  Chat on WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="ks-footer-bottom">
          <span>© {currentYear} KaamSaathi by Kamet. All rights reserved.</span>
          <div className="ks-footer-bottom-links">
            <a href="#" className="ks-footer-bottom-link">Privacy</a>
            <a href="#" className="ks-footer-bottom-link">Terms</a>
          </div>
        </div>
      </footer>
    </>
  );
}

const footerStyles = `
.ks-footer {
  background: linear-gradient(160deg, #3d1a08 0%, #260c03 50%, #3d1a08 100%);
  border-top: 1px solid rgba(255,165,31,.18);
  font-family: 'Belleza', sans-serif;
  position: relative;
  overflow: hidden;
}
.ks-footer::before {
  content: '';
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 800px; height: 400px;
  background: radial-gradient(ellipse, rgba(255,226,41,.04) 0%, transparent 65%);
  pointer-events: none;
}

.ks-footer-inner {
  position: relative;
  z-index: 1;
  max-width: 1160px;
  margin: 0 auto;
  padding: 56px 32px 40px;
  display: grid;
  grid-template-columns: 1.5fr 1fr 1.4fr 1fr;
  gap: 40px;
}
@media(max-width:900px){
  .ks-footer-inner { grid-template-columns: 1fr 1fr; gap: 32px; }
}
@media(max-width:560px){
  .ks-footer-inner { grid-template-columns: 1fr; gap: 28px; padding: 40px 20px 28px; }
}

/* Brand column */
.ks-footer-brand {}
.ks-footer-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}
.ks-footer-logo-icon {
  height: 38px;
  width: auto;
  object-fit: contain;
}
.ks-footer-logo-text {
  height: 28px;
  width: auto;
  object-fit: contain;
  /* tint the text logo to work on dark background */
  filter: brightness(0) invert(1) sepia(1) saturate(2) hue-rotate(5deg);
  opacity: 0.92;
}
.ks-footer-tagline {
  font-size: 13px;
  color: rgba(237,207,181,.52);
  line-height: 1.65;
  margin-bottom: 12px;
}
.ks-footer-kamet {
  font-size: 12px;
  color: rgba(237,207,181,.38);
}
.ks-footer-kamet-link {
  color: #ffa51f;
  text-decoration: none;
  transition: color .2s;
}
.ks-footer-kamet-link:hover { color: #ffe229; }

/* Columns */
.ks-footer-col {}
.ks-footer-col-title {
  font-family: 'Rozha One', serif;
  font-size: 13px;
  font-weight: 400;
  color: #edcfb5;
  letter-spacing: .06em;
  text-transform: uppercase;
  margin-bottom: 16px;
}
.ks-footer-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.ks-footer-link {
  font-size: 13.5px;
  color: rgba(237,207,181,.5);
  text-decoration: none;
  transition: color .2s;
  line-height: 1.4;
}
.ks-footer-link:hover { color: #ffa51f; }

/* Contact items */
.ks-footer-contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
  color: rgba(237,207,181,.5);
}
.ks-footer-contact-icon { flex-shrink: 0; color: rgba(237,207,181,.4); }
.ks-footer-whatsapp {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 13.5px;
  color: #ffa51f;
  text-decoration: none;
  transition: color .2s;
  margin-top: 2px;
}
.ks-footer-whatsapp:hover { color: #ffe229; }

/* Bottom bar */
.ks-footer-bottom {
  position: relative;
  z-index: 1;
  max-width: 1160px;
  margin: 0 auto;
  padding: 16px 32px 20px;
  border-top: 1px solid rgba(255,255,255,.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 12px;
  color: rgba(237,207,181,.28);
}
@media(max-width:560px){
  .ks-footer-bottom { padding: 16px 20px 20px; justify-content: center; text-align: center; }
}
.ks-footer-bottom-links {
  display: flex;
  gap: 18px;
}
.ks-footer-bottom-link {
  font-size: 12px;
  color: rgba(237,207,181,.28);
  text-decoration: none;
  transition: color .2s;
}
.ks-footer-bottom-link:hover { color: rgba(237,207,181,.6); }
`;
