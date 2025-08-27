import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Link, MessageSquare, User, Download, Copy, Check, Sun, Moon } from 'lucide-react';

// Çeviriler - örnek eklenmiş
const TRANSLATIONS = {
  "tr-TR": {
    "appTitle": "QR Kod Üreticisi",
    "appDescription": "URL, metin ve iletişim bilgileri için QR kodları oluşturun - Her zaman güvenli bir şekilde",
    "contactMessage": "🔗 Eğer sitede hata varsa ve ya siteye eklenmesini istediğiniz bir şey varsa lütfen site sahibi ile iletişim kurun: Website - www.karimov.info",
    "urlTab": "URL",
    "textTab": "Metin",
    "contactTab": "İletişim",
    "enterUrl": "URL Girin",
    "enterText": "Metin Girin",
    "contactInformation": "İletişim Bilgileri",
    "websiteUrl": "Website URL",
    "urlPlaceholder": "ornek.com veya https://ornek.com",
    "urlHelp": "Bir website URL'si girin. http:// eklemezseniz, otomatik olarak https:// ekleyeceğiz.",
    "textContent": "Metin İçeriği",
    "textPlaceholder": "QR kodu oluşturmak için herhangi bir metin girin...",
    "firstName": "Ad",
    "firstNamePlaceholder": "Ahmet",
    "lastName": "Soyad",
    "lastNamePlaceholder": "Yılmaz",
    "phoneNumber": "Telefon Numarası",
    "phonePlaceholder": "+90 (555) 123-4567",
    "emailAddress": "E-posta Adresi",
    "emailPlaceholder": "ahmet.yilmaz@ornek.com",
    "organization": "Kuruluş",
    "organizationPlaceholder": "Şirket Adı",
    "website": "Website",
    "websitePlaceholder": "https://ornek.com",
    "clearAllFields": "Tüm Alanları Temizle",
    "generatedQrCode": "Oluşturulan QR Kod",
    "scanQrCode": "Bu QR kodu cihazınızla tarayın",
    "fillFormPrompt": "QR kodunuzu oluşturmak için formu doldurun",
    "download": "İndir",
    "copyData": "Veriyi Kopyala",
    "copied": "Kopyalandı!",
    "qrCodeData": "QR Kod Verisi:",
    "footerText": "Anında QR kodları oluşturun • Veri saklanmaz • Ücretsiz",
    "relatedProductsTitle": "İlgili Ürünlerimiz",
    "pdfToPngDescription": "PDF dosyalarınızı yüksek kalitede PNG formatına güvenli ve hızlı bir şekilde dönüştürün.",
    "visitPdfToPng": "PDF to PNG Dönüştürücü",
    "qrCodeAlt": "Oluşturulan QR Kod",
    "languageSwitch": "English",
    "currentLanguage": "Türkçe"
  },
  "en-US": {
    "appTitle": "QR Code Generator",
    "appDescription": "Generate QR codes for URLs, text, and contact information - Always safely",
    "contactMessage": "🔗 If there are any errors on the site or if you would like something to be added to the site, please contact the site owner: Website - www.karimov.info",
    "urlTab": "URL",
    "textTab": "Text",
    "contactTab": "Contact",
    "enterUrl": "Enter URL",
    "enterText": "Enter Text",
    "contactInformation": "Contact Information",
    "websiteUrl": "Website URL",
    "urlPlaceholder": "example.com or https://example.com",
    "urlHelp": "Enter a website URL. If you don't include http://, we'll add https:// automatically.",
    "textContent": "Text Content",
    "textPlaceholder": "Enter any text to generate QR code...",
    "firstName": "First Name",
    "firstNamePlaceholder": "John",
    "lastName": "Last Name",
    "lastNamePlaceholder": "Doe",
    "phoneNumber": "Phone Number",
    "phonePlaceholder": "+1 (555) 123-4567",
    "emailAddress": "Email Address",
    "emailPlaceholder": "john.doe@example.com",
    "organization": "Organization",
    "organizationPlaceholder": "Company Name",
    "website": "Website",
    "websitePlaceholder": "https://example.com",
    "clearAllFields": "Clear All Fields",
    "generatedQrCode": "Generated QR Code",
    "scanQrCode": "Scan this QR code with your device",
    "fillFormPrompt": "Fill in the form to generate your QR code",
    "download": "Download",
    "copyData": "Copy Data",
    "copied": "Copied!",
    "qrCodeData": "QR Code Data:",
    "footerText": "Generate QR codes instantly • No data stored • Free to use",
    "relatedProductsTitle": "Our Related Products",
    "pdfToPngDescription": "Convert your PDF files to high-quality PNG format safely and quickly.",
    "visitPdfToPng": "PDF to PNG Converter",
    "qrCodeAlt": "Generated QR Code",
    "languageSwitch": "Türkçe",
    "currentLanguage": "English"
  }
};

const QRCodeGenerator = () => {
  // Dil ve tema state'leri
  const [currentLocale, setCurrentLocale] = useState('tr-TR');
  const [theme, setTheme] = useState('dark'); // Varsayılan: karanlık mod

  const t = (key) => TRANSLATIONS[currentLocale]?.[key] || TRANSLATIONS['tr-TR'][key] || key;

  const toggleLanguage = () => {
    setCurrentLocale(currentLocale === 'tr-TR' ? 'en-US' : 'tr-TR');
  };

  // Tema yükleme ve kaydetme
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme('dark'); // Varsayılan karanlık
    }
  }, []);

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const [activeTab, setActiveTab] = useState('url');
  const [qrData, setQrData] = useState('');
  const [copied, setCopied] = useState(false);
  const qrContainerRef = useRef(null);

  // Form states
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [contactInfo, setContactInfo] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    organization: '',
    url: ''
  });

  // QR Code generation
  const generateQRCode = async (text, tabType) => {
    if (!text.trim()) {
      if (qrContainerRef.current) {
        qrContainerRef.current.innerHTML = '';
      }
      return;
    }

    try {
      if (!window.QRious) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js';
        script.onload = () => {
          createQR(text, tabType);
        };
        document.head.appendChild(script);
      } else {
        createQR(text, tabType);
      }
    } catch (error) {
      console.error('Error loading QR library:', error);
      generateFallbackQR(text, tabType);
    }
  };

  const encodeUTF8 = (text) => unescape(encodeURIComponent(text));

  const createQR = (text, tabType) => {
    if (!qrContainerRef.current) return;

    try {
      qrContainerRef.current.innerHTML = '';
      const canvas = document.createElement('canvas');
      qrContainerRef.current.appendChild(canvas);

      const paddingValue = (tabType === 'contact') ? 0 : 11;
      new window.QRious({
        element: canvas,
        value: encodeUTF8(text),
        size: 400,
        background: 'white',
        foreground: 'black',
        level: 'M',
        padding: paddingValue
      });

      canvas.className = 'qr-image';
    } catch (error) {
      console.error('Error creating QR code:', error);
      generateFallbackQR(text, tabType);
    }
  };

  const generateContactQRCode = async (text) => {
    if (!text.trim()) {
      if (qrContainerRef.current) {
        qrContainerRef.current.innerHTML = '';
      }
      return;
    }

    try {
      if (!window.QRious) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js';
        script.onload = () => {
          createContactQR(text);
        };
        document.head.appendChild(script);
      } else {
        createContactQR(text);
      }
    } catch (error) {
      console.error('Error loading QR library:', error);
      generateContactFallbackQR(text);
    }
  };

  const createContactQR = (text) => {
    if (!qrContainerRef.current) return;

    try {
      qrContainerRef.current.innerHTML = '';
      const canvas = document.createElement('canvas');
      qrContainerRef.current.appendChild(canvas);

      new window.QRious({
        element: canvas,
        value: encodeUTF8(text),
        size: 400,
        background: 'white',
        foreground: 'black',
        level: 'M'
      });

      canvas.className = 'qr-image';
    } catch (error) {
      console.error('Error creating QR code:', error);
      generateContactFallbackQR(text);
    }
  };

  const generateContactFallbackQR = (text) => {
    if (!qrContainerRef.current) return;

    qrContainerRef.current.innerHTML = '';
    const img = document.createElement('img');
    const encodedData = encodeURIComponent(text);
    img.src = `https://chart.googleapis.com/chart?chs=400x400&cht=qr&chl=${encodedData}&choe=UTF-8`;
    img.alt = t('qrCodeAlt');
    img.className = 'qr-image';

    img.onerror = () => {
      img.src = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodedData}&format=png&margin=0`;
    };

    qrContainerRef.current.appendChild(img);
  };

  const generateFallbackQR = (text, tabType) => {
    if (!qrContainerRef.current) return;

    qrContainerRef.current.innerHTML = '';
    const img = document.createElement('img');
    const encodedData = encodeURIComponent(text);
    const marginParam = (tabType === 'contact') ? '' : '&chld=M|1';
    img.src = `https://chart.googleapis.com/chart?chs=400x400&cht=qr&chl=${encodedData}&choe=UTF-8${marginParam}`;
    img.alt = t('qrCodeAlt');
    img.className = 'qr-image';

    img.onerror = () => {
      const marginValue = (tabType === 'contact') ? 0 : 1;
      img.src = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodedData}&format=png&margin=${marginValue}&ecc=M`;
    };

    qrContainerRef.current.appendChild(img);
  };

  const formatUrl = (url) => {
    if (!url.trim()) return '';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url;
    }
    return url;
  };

  const generateVCard = (contact) => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${contact.firstName} ${contact.lastName}
N:${contact.lastName};${contact.firstName};;;
ORG:${contact.organization}
TEL:${contact.phone}
EMAIL:${contact.email}
URL:${contact.url}
END:VCARD`;
    return vcard;
  };

  useEffect(() => {
    const generateAndSetQR = async () => {
      let data = '';

      switch (activeTab) {
        case 'url':
          data = formatUrl(urlInput);
          await generateQRCode(data, 'url');
          break;
        case 'text':
          data = textInput;
          await generateQRCode(data, 'text');
          break;
        case 'contact':
          if (contactInfo.firstName || contactInfo.lastName || contactInfo.phone || contactInfo.email) {
            data = generateVCard(contactInfo);
          }
          await generateContactQRCode(data);
          break;
        default:
          data = '';
      }

      setQrData(data);
    };

    generateAndSetQR();
  }, [activeTab, urlInput, textInput, contactInfo]);

  const downloadQRCode = () => {
    if (!qrData) return;

    const canvas = qrContainerRef.current?.querySelector('canvas');
    const img = qrContainerRef.current?.querySelector('img');

    if (canvas) {
      const link = document.createElement('a');
      link.download = `qr-code-${activeTab}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } else if (img) {
      const link = document.createElement('a');
      link.download = `qr-code-${activeTab}.png`;
      link.href = img.src;
      link.click();
    }
  };

  const copyToClipboard = async () => {
    if (qrData) {
      try {
        await navigator.clipboard.writeText(qrData);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  const resetForm = () => {
    setUrlInput('');
    setTextInput('');
    setContactInfo({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      organization: '',
      url: ''
    });
    setQrData('');
    if (qrContainerRef.current) {
      qrContainerRef.current.innerHTML = '';
    }
  };

  const tabs = [
    { id: 'url', label: t('urlTab'), icon: Link },
    { id: 'text', label: t('textTab'), icon: MessageSquare },
    { id: 'contact', label: t('contactTab'), icon: User }
  ];

  return (
  <div className="app-container">
    <div className="max-w-container">
      <div className="header-container">
        <div className="header-icon">
          <QrCode size={32} color="white" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '16px' }}>
          <h1 className="header-title">{t('appTitle')}</h1>
          <div className="header-controls" style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}>
            {/* Dil değiştirme butonu */}
            <button
              onClick={toggleLanguage}
              className="btn btn-secondary"
              style={{
                padding: '8px 16px',
                fontSize: '0.875rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              🌐 {t('languageSwitch')}
            </button>
            {/* Tema değiştirme toggle butonu */}
            <div 
              className="theme-toggle" 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <div className="toggle-slider">
                {theme === 'dark' ? '🌙' : '☀️'}
              </div>
            </div>
          </div>
        </div>
        <p className="header-description">{t('appDescription')}</p>
        {/* İLETİŞİM MESAJI */}
        <div className="contact-message">
          {t('contactMessage').split('www.karimov.info').map((part, index) => {
            if (index === 0) return part;
            return (
              <span key={index}>
                <a href="https://www.karimov.info" target="_blank" rel="noopener noreferrer">
                  www.karimov.info
                </a>
              </span>
            );
          })}
        </div>
      </div>

          <div className="related-products-main">
            <h3 className="related-products-title">{t('relatedProductsTitle')}</h3>
            <div className="product-card">
              <p className="product-description">
                {t('pdfToPngDescription')}
              </p>
              <a 
                href="https://pdf2png-ihrx.onrender.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="product-link"
              >
                {t('visitPdfToPng')}
              </a>
            </div>
          </div>

        <div className="main-card">
          <div className="tab-container">
            <nav className="tab-nav">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                  >
                    <IconComponent size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="content-container">
            <div className="content-grid">
              <div className="form-section">
                <h2 className="section-title">
                  {activeTab === 'url' && t('enterUrl')}
                  {activeTab === 'text' && t('enterText')}
                  {activeTab === 'contact' && t('contactInformation')}
                </h2>

                {activeTab === 'url' && (
                  <div className="input-group">
                    <label className="input-label">{t('websiteUrl')}</label>
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder={t('urlPlaceholder')}
                      className="input-field"
                    />
                    <p className="input-help">{t('urlHelp')}</p>
                  </div>
                )}

                {activeTab === 'text' && (
                  <div className="input-group">
                    <label className="input-label">{t('textContent')}</label>
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder={t('textPlaceholder')}
                      rows={4}
                      className="input-field textarea-field"
                    />
                  </div>
                )}

                {activeTab === 'contact' && (
                  <div className="form-group">
                    <div className="form-row">
                      <div className="input-group">
                        <label className="input-label">{t('firstName')}</label>
                        <input
                          type="text"
                          value={contactInfo.firstName}
                          onChange={(e) => setContactInfo({ ...contactInfo, firstName: e.target.value })}
                          placeholder={t('firstNamePlaceholder')}
                          className="input-field"
                        />
                      </div>
                      <div className="input-group">
                        <label className="input-label">{t('lastName')}</label>
                        <input
                          type="text"
                          value={contactInfo.lastName}
                          onChange={(e) => setContactInfo({ ...contactInfo, lastName: e.target.value })}
                          placeholder={t('lastNamePlaceholder')}
                          className="input-field"
                        />
                      </div>
                    </div>
                    <div className="input-group">
                      <label className="input-label">{t('phoneNumber')}</label>
                      <input
                        type="tel"
                        value={contactInfo.phone}
                        onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                        placeholder={t('phonePlaceholder')}
                        className="input-field"
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">{t('emailAddress')}</label>
                      <input
                        type="email"
                        value={contactInfo.email}
                        onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                        placeholder={t('emailPlaceholder')}
                        className="input-field"
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">{t('organization')}</label>
                      <input
                        type="text"
                        value={contactInfo.organization}
                        onChange={(e) => setContactInfo({ ...contactInfo, organization: e.target.value })}
                        placeholder={t('organizationPlaceholder')}
                        className="input-field"
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">{t('website')}</label>
                      <input
                        type="url"
                        value={contactInfo.url}
                        onChange={(e) => setContactInfo({ ...contactInfo, url: e.target.value })}
                        placeholder={t('websitePlaceholder')}
                        className="input-field"
                      />
                    </div>
                  </div>
                )}

                <button onClick={resetForm} className="btn btn-secondary btn-full">
                  {t('clearAllFields')}
                </button>
              </div>

              <div className="qr-section">
                <h2 className="section-title">{t('generatedQrCode')}</h2>
                <div className="qr-container">
                  {qrData ? (
                    <div className="qr-display">
                      <div ref={qrContainerRef}></div>
                      <p className="qr-help-text">{t('scanQrCode')}</p>
                    </div>
                  ) : (
                    <div className="qr-placeholder">
                      <QrCode size={64} className="qr-placeholder-icon" />
                      <p className="qr-placeholder-text">{t('fillFormPrompt')}</p>
                    </div>
                  )}
                </div>

                {qrData && (
                  <div className="btn-group">
                    <button onClick={downloadQRCode} className="btn btn-primary btn-flex">
                      <Download size={16} />
                      {t('download')}
                    </button>
                    <button onClick={copyToClipboard} className="btn btn-secondary btn-flex">
                      {copied ? (
                        <>
                          <Check size={16} className="success-icon" />
                          {t('copied')}
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          {t('copyData')}
                        </>
                      )}
                    </button>
                  </div>
                )}

                {qrData && (
                  <div className="qr-data-section">
                    <h3 className="qr-data-title">{t('qrCodeData')}</h3>
                    <div className="qr-data-content">{qrData}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="footer">
          <p>{t('footerText')}</p>
        </div>
        </div>
      </div>
  );
};

export default QRCodeGenerator;