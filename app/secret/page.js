'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

const STORAGE_KEY = 'mk_quest_completed';

// Compress + resize image client-side before upload
function compressImage(file, maxPx = 1024, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxPx || height > maxPx) {
          if (width >= height) { height = Math.round(height * maxPx / width); width = maxPx; }
          else                  { width  = Math.round(width  * maxPx / height); height = maxPx; }
        }
        const canvas = document.createElement('canvas');
        canvas.width  = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const base64  = dataUrl.split(',')[1];
        resolve({ base64, dataUrl });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ── Transform section (client component) ──────────────────────
function TransformSection() {
  const [status,       setStatus]       = useState('idle'); // idle|preview|loading|done|error
  const [previewUrl,   setPreviewUrl]   = useState(null);
  const [resultUrl,    setResultUrl]    = useState(null);
  const [errorMsg,     setErrorMsg]     = useState('');
  const [isDragging,   setIsDragging]   = useState(false);
  const fileRef    = useRef(null);
  const imageRef   = useRef(null); // stores { base64, mediaType } for API call

  const LOADING_MSGS = [
    'The System is analyzing your form…',
    'Forging new muscle fibers…',
    'Expanding your frame…',
    'Granting the power of the ascended…',
    'Almost there — your transformation awaits…',
  ];
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MSGS[0]);
  const msgIntervalRef = useRef(null);

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const { base64, dataUrl } = await compressImage(file);
    imageRef.current = { base64, mediaType: 'image/jpeg' };
    setPreviewUrl(dataUrl);
    setResultUrl(null);
    setErrorMsg('');
    setStatus('preview');
  };

  const onInputChange = (e) => handleFile(e.target.files[0]);

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const transform = async () => {
    setStatus('loading');
    setLoadingMsg(LOADING_MSGS[0]);
    let msgIdx = 0;
    msgIntervalRef.current = setInterval(() => {
      msgIdx = Math.min(msgIdx + 1, LOADING_MSGS.length - 1);
      setLoadingMsg(LOADING_MSGS[msgIdx]);
    }, 8000);

    try {
      const res = await fetch('/api/transform', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(imageRef.current),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || 'Something went wrong.');
        setStatus('error');
      } else {
        setResultUrl(data.image);
        setStatus('done');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStatus('error');
    } finally {
      clearInterval(msgIntervalRef.current);
    }
  };

  const reset = () => {
    setStatus('idle');
    setPreviewUrl(null);
    setResultUrl(null);
    setErrorMsg('');
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className={styles.transformSection}>
      <div className={styles.transformHeader}>
        <span className="section-tag">The System&apos;s Gift</span>
        <h2 className={styles.transformTitle}>Ascend Your Form</h2>
        <p className={styles.transformSub}>
          Upload a photo of a person. The System will forge them into a champion —
          20+ kg of muscle, granted instantly.
        </p>
      </div>

      {/* Upload zone — shown when idle */}
      {(status === 'idle') && (
        <div
          className={`${styles.dropZone} ${isDragging ? styles.dropZoneDrag : ''}`}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.code === 'Space' && fileRef.current?.click()}
          aria-label="Upload image"
        >
          <div className={styles.dropIcon}>⬆</div>
          <p className={styles.dropLabel}>Drop an image or click to browse</p>
          <p className={styles.dropSub}>JPG, PNG, WEBP — max ~5 MB</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className={styles.fileInput}
            onChange={onInputChange}
          />
        </div>
      )}

      {/* Preview + transform button */}
      {(status === 'preview' || status === 'error') && (
        <div className={styles.previewArea}>
          <div className={styles.imageBox}>
            <span className={styles.imageBoxLabel}>Original</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Uploaded" className={styles.previewImg} />
          </div>
          <div className={styles.arrowCol}>
            <span className={styles.arrow}>→</span>
          </div>
          <div className={`${styles.imageBox} ${styles.imageBoxEmpty}`}>
            <span className={styles.imageBoxLabel}>Ascended</span>
            <div className={styles.emptySlot}>
              {status === 'error'
                ? <p className={styles.errorMsg}>⚠ {errorMsg}</p>
                : <p className={styles.emptyHint}>Your transformed self awaits</p>
              }
            </div>
          </div>
          <div className={styles.previewActions}>
            <button className="btn btn-primary btn-large" onClick={transform}>
              Ascend →
            </button>
            <button className="btn btn-ghost" onClick={reset}>
              Change Photo
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {status === 'loading' && (
        <div className={styles.loadingArea}>
          <div className={styles.loadingOrb} />
          <p className={styles.loadingMsg}>{loadingMsg}</p>
          <p className={styles.loadingSub}>This may take up to 30 seconds</p>
        </div>
      )}

      {/* Result */}
      {status === 'done' && (
        <div className={styles.resultArea}>
          <div className={styles.imageBox}>
            <span className={styles.imageBoxLabel}>Before</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Original" className={styles.previewImg} />
          </div>
          <div className={styles.arrowCol}>
            <span className={`${styles.arrow} ${styles.arrowGlow}`}>→</span>
          </div>
          <div className={styles.imageBox}>
            <span className={styles.imageBoxLabel}>Ascended</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resultUrl} alt="Transformed" className={styles.previewImg} />
          </div>
          <div className={styles.previewActions}>
            <a
              href={resultUrl}
              download="ascended.jpg"
              className="btn btn-primary"
            >
              Download
            </a>
            <button className="btn btn-ghost" onClick={reset}>
              Try Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────
export default function SecretPage() {
  const [level,   setLevel]   = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      setLevel(Array.isArray(saved) ? saved.length : 0);
    } catch {
      setLevel(0);
    }
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (level < 5) {
    return (
      <div className={styles.locked}>
        <div className={styles.lockedCard}>
          <div className={styles.lockIcon}>⬡</div>
          <h1 className={styles.lockedTitle}>Access Denied</h1>
          <p className={styles.lockedDesc}>
            This realm is sealed. Complete all 5 system challenges to enter.
          </p>
          <div className={styles.lockedProgress}>
            <span className={styles.lockedLv}>{level} / 5</span>
            <span className={styles.lockedSub}>challenges complete</span>
          </div>
          <Link href="/#challenges" className="btn btn-ghost">
            ← Back to Challenges
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.backLink}>← Portfolio</Link>
        <span className={styles.navBadge}>LV. 5 — ASCENDED</span>
      </nav>

      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.grid} />
        <div className={styles.heroContent}>
          <div className={styles.badge}>⬡ YOU HAVE ASCENDED</div>
          <h1 className={styles.title}>
            You Have{' '}
            <span className="gradient-text">Ascended</span>
          </h1>
          <p className={styles.sub}>
            Few reach this place. You conquered every trial the System placed before you.
            You are no longer a visitor — you are a champion.
          </p>
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <span className={styles.statVal}>5</span>
              <span className={styles.statLabel}>Quests Cleared</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statVal}>LV.5</span>
              <span className={styles.statLabel}>Max Rank</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statVal}>100%</span>
              <span className={styles.statLabel}>Completion</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Transform feature */}
      <TransformSection />
    </div>
  );
}
