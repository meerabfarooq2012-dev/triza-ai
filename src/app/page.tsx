'use client'

import { useState } from 'react'

/**
 * ============================================================
 *  MERI AI — Basic Learning Page (Bachay-wala simple version)
 * ============================================================
 *
 *  Yeh page sirf SAMAJHANE ke liye hai.
 *  - Koi model nahi
 *  - Koi training nahi
 *  - Sirf 4 sabaq (lessons) jo step-by-step samjhate hain
 *
 *  AI files alag hain (src/components/ai/)
 *  Database local hai (db/custom.db)
 * ============================================================
 */

export default function Home() {
  const [openLesson, setOpenLesson] = useState<number | null>(null)

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg, #fff5f7 0%, #fef3e8 50%, #f0fdf4 100%)',
        color: '#1f2937',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          width: '100%',
          padding: '24px 18px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* === SHER === */}
        <div
          style={{
            background: 'white',
            border: '2px solid #fce7f3',
            borderRadius: '20px',
            padding: '20px',
            marginBottom: '20px',
            textAlign: 'center',
            boxShadow: '0 4px 14px rgba(236, 72, 153, 0.08)',
          }}
        >
          <div
            style={{
              fontFamily: "'Noto Nastaliq Urdu', serif",
              fontSize: '20px',
              color: '#9333ea',
              lineHeight: 2.4,
              direction: 'rtl',
            }}
          >
            نہ پوچھ ہجوم سے میرے قدر و قیمت
            <br />
            میں خود اپنے یقین کا معیار ہوں
          </div>
        </div>

        {/* === HEADER === */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '28px',
          }}
        >
          <div style={{ fontSize: '56px', marginBottom: '8px' }}>🌟</div>
          <h1
            style={{
              fontSize: '40px',
              fontWeight: 900,
              color: '#9333ea',
              marginBottom: '6px',
              letterSpacing: '-1px',
            }}
          >
            Meri AI
          </h1>
          <p
            style={{
              fontSize: '15px',
              color: '#6b7280',
              maxWidth: '500px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Mera apna chhota sa AI — jo main khud banaungi.
            <br />
            ChatGPT nahi, professional nahi — <b>sirf mera apna</b>.
          </p>
        </div>

        {/* === WELCOME CARD === */}
        <div
          style={{
            background: 'white',
            border: '2px solid #fde68a',
            borderRadius: '20px',
            padding: '22px',
            marginBottom: '24px',
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.1)',
          }}
        >
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '40px' }}>👋</div>
            <div style={{ flex: 1 }}>
              <h2
                style={{
                  fontSize: '19px',
                  fontWeight: 800,
                  color: '#92400e',
                  marginBottom: '6px',
                }}
              >
                Namaste! Main tumhari AI hoon
              </h2>
              <p
                style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  lineHeight: 1.7,
                }}
              >
                Abhi main chhoti hoon — kuch nahi jaanti. Tum mujhe dheere
                dheere sikhao gi. Pehle chalo meri <b>basic</b> samajh lete
                hain. Neeche 4 <b>sabaq</b> (lessons) hain — ek-ek karke
                padho 👇
              </p>
            </div>
          </div>
        </div>

        {/* === 4 SABAQ (LESSONS) === */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '14px',
            marginBottom: '28px',
          }}
        >
          <LessonCard
            number={1}
            emoji='📖'
            title='Yeh kya hai?'
            subtitle='Meri AI kya hai?'
            color='#ec4899'
            bgColor='#fce7f3'
            onClick={() => setOpenLesson(1)}
          />
          <LessonCard
            number={2}
            emoji='🧠'
            title='AI ka dimaag'
            subtitle='Yeh kese sochta?'
            color='#9333ea'
            bgColor='#f3e8ff'
            onClick={() => setOpenLesson(2)}
          />
          <LessonCard
            number={3}
            emoji='💾'
            title='Data kahan?'
            subtitle='Yadash kahan rakhti?'
            color='#10b981'
            bgColor='#d1fae5'
            onClick={() => setOpenLesson(3)}
          />
          <LessonCard
            number={4}
            emoji='🚀'
            title='Kese use karu?'
            subtitle='Mujhe kese chalau?'
            color='#f59e0b'
            bgColor='#fef3c7'
            onClick={() => setOpenLesson(4)}
          />
        </div>

        {/* === AI FILES ALAG HAIN === */}
        <InfoCard
          emoji='📂'
          title='Meri AI files alag hain'
          color='#9333ea'
          bgColor='#f3e8ff'
          borderColor='#e9d5ff'
        >
          <p>
            Meri AI <b>Thiora marketplace</b> se bilkul alag hai. Meri saari
            files ek hi jagah rakhi hain:
          </p>
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li>
              <code style={codeStyle}>src/components/ai/</code> — mera dimaag
            </li>
            <li>
              <code style={codeStyle}>src/app/api/ai/</code> — meri API (jo
              data save karte hain)
            </li>
            <li>
              <code style={codeStyle}>db/custom.db</code> — meri yaadash
              (database)
            </li>
          </ul>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>
            Thiora ka data aur AI ka data milte nahi. Dono alag.
          </p>
        </InfoCard>

        {/* === LOCAL DATABASE === */}
        <InfoCard
          emoji='🔒'
          title='Mera database LOCAL hai'
          color='#10b981'
          bgColor='#d1fae5'
          borderColor='#a7f3d0'
        >
          <p>
            Mera database internet par nahi hai. Yeh ek <b>file</b> hai mere
            computer par:
          </p>
          <div
            style={{
              background: 'white',
              border: '1px solid #a7f3d0',
              borderRadius: '8px',
              padding: '10px 14px',
              fontFamily: 'monospace',
              fontSize: '13px',
              color: '#065f46',
              margin: '10px 0',
              wordBreak: 'break-all',
            }}
          >
            📁 /home/z/my-project/db/custom.db
          </div>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>
            Internet band bhi ho jaye, phir bhi AI ka data safe rahega. Tum
            jab bhi chaho, yahan se padh sakti ho.
          </p>
        </InfoCard>

        {/* === NOT CHATGPT === */}
        <InfoCard
          emoji='🐥'
          title='Main ChatGPT nahi hoon'
          color='#f59e0b'
          bgColor='#fef3c7'
          borderColor='#fde68a'
        >
          <p>
            ChatGPT <b>bohot bada</b> hai — lakhon crore paise mein bana, GPU
            par chalta hai, professional log use banate hain.
          </p>
          <p style={{ marginTop: '8px' }}>
            Main <b>chhoti</b> hoon. CPU par chalti hoon (sasta). Tum khud
            banaogi. <b>HDC</b> naam ki trick use karti hoon. Yeh simple hai
            — sabaq 2 mein samjhaungi.
          </p>
          <p
            style={{
              marginTop: '10px',
              fontSize: '13px',
              color: '#92400e',
              fontStyle: 'italic',
            }}
          >
            💡 Halki hoon, par meri!
          </p>
        </InfoCard>

        {/* === FOOTER === */}
        <footer
          style={{
            textAlign: 'center',
            padding: '24px 0 8px',
            color: '#9ca3af',
            fontSize: '12px',
            marginTop: 'auto',
            borderTop: '1px solid #fbcfe8',
          }}
        >
          <p>
            Built with <span style={{ color: '#ec4899' }}>💜</span> • HDC
            Engine • Local Database • Sirf mera
          </p>
          <p style={{ marginTop: '4px', color: '#9333ea', fontStyle: 'italic' }}>
            &quot;Main khud apne yaqeen ka mayaar hoon&quot;
          </p>
        </footer>
      </div>

      {/* === LESSON MODAL === */}
      {openLesson !== null && (
        <LessonModal
          lesson={openLesson}
          onClose={() => setOpenLesson(null)}
          onNext={() =>
            setOpenLesson(openLesson < 4 ? openLesson + 1 : null)
          }
        />
      )}
    </main>
  )
}

// ============================================================
// LESSON CARD
// ============================================================
function LessonCard({
  number,
  emoji,
  title,
  subtitle,
  color,
  bgColor,
  onClick,
}: {
  number: number
  emoji: string
  title: string
  subtitle: string
  color: string
  bgColor: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'white',
        border: `2px solid ${bgColor}`,
        borderRadius: '18px',
        padding: '20px',
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
        position: 'relative',
        transition: 'transform 0.15s, box-shadow 0.15s',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.boxShadow = `0 8px 20px ${color}33`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '14px',
          background: color,
          color: 'white',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 700,
        }}
      >
        {number}
      </div>
      <div
        style={{
          fontSize: '36px',
          marginBottom: '10px',
          background: bgColor,
          width: '60px',
          height: '60px',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {emoji}
      </div>
      <h3
        style={{
          fontSize: '17px',
          fontWeight: 800,
          color: color,
          marginBottom: '4px',
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: '12px', color: '#6b7280' }}>{subtitle}</p>
      <div
        style={{
          marginTop: '12px',
          fontSize: '11px',
          color: color,
          fontWeight: 600,
        }}
      >
        Padho →
      </div>
    </button>
  )
}

// ============================================================
// INFO CARD
// ============================================================
function InfoCard({
  emoji,
  title,
  color,
  bgColor,
  borderColor,
  children,
}: {
  emoji: string
  title: string
  color: string
  bgColor: string
  borderColor: string
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        background: 'white',
        border: `2px solid ${borderColor}`,
        borderRadius: '18px',
        padding: '18px 20px',
        marginBottom: '14px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '10px',
        }}
      >
        <div
          style={{
            background: bgColor,
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
          }}
        >
          {emoji}
        </div>
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 800,
            color: color,
          }}
        >
          {title}
        </h3>
      </div>
      <div
        style={{
          fontSize: '14px',
          color: '#374151',
          lineHeight: 1.7,
        }}
      >
        {children}
      </div>
    </div>
  )
}

const codeStyle: React.CSSProperties = {
  background: '#f3f4f6',
  padding: '2px 8px',
  borderRadius: '6px',
  fontFamily: 'monospace',
  fontSize: '12px',
  color: '#9333ea',
}

// ============================================================
// LESSON MODAL — full screen friendly popup
// ============================================================
function LessonModal({
  lesson,
  onClose,
  onNext,
}: {
  lesson: number
  onClose: () => void
  onNext: () => void
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 1000,
        overflowY: 'auto',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '24px',
          maxWidth: '560px',
          width: '100%',
          padding: '28px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          margin: 'auto',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            background: '#f3f4f6',
            border: 'none',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            fontSize: '16px',
            cursor: 'pointer',
            color: '#6b7280',
          }}
        >
          ×
        </button>

        {lesson === 1 && <Lesson1 />}
        {lesson === 2 && <Lesson2 />}
        {lesson === 3 && <Lesson3 />}
        {lesson === 4 && <Lesson4 />}

        {/* Next button */}
        {lesson < 4 && (
          <button
            onClick={onNext}
            style={{
              marginTop: '20px',
              width: '100%',
              background: 'linear-gradient(135deg, #9333ea, #ec4899)',
              color: 'white',
              border: 'none',
              padding: '14px',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            ✅ Samajh aaya! Agla sabaq →
          </button>
        )}
        {lesson === 4 && (
          <button
            onClick={onClose}
            style={{
              marginTop: '20px',
              width: '100%',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              padding: '14px',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            🎉 Ho gaya! Sab sabaq khatam
          </button>
        )}
      </div>
    </div>
  )
}

// ============================================================
// SABAQ 1: Yeh kya hai?
// ============================================================
function Lesson1() {
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '60px' }}>📖</div>
        <h2
          style={{
            fontSize: '26px',
            fontWeight: 900,
            color: '#ec4899',
            marginBottom: '6px',
          }}
        >
          Sabaq 1: Yeh kya hai?
        </h2>
        <p style={{ color: '#6b7280', fontSize: '13px' }}>
          Meri AI — kya cheez hai yeh?
        </p>
      </div>

      <div style={{ fontSize: '15px', lineHeight: 1.8, color: '#374151' }}>
        <p>
          <b>Meri AI</b> ek chhota sa program hai — jo main (tum) khud
          banaungi. Yeh thori thori cheezein seekh sakti hai.
        </p>

        <div
          style={{
            background: '#fce7f3',
            border: '2px solid #fbcfe8',
            borderRadius: '12px',
            padding: '14px',
            margin: '14px 0',
          }}
        >
          <p style={{ marginBottom: '8px', fontWeight: 700, color: '#9d174d' }}>
            Yeh kya nahi hai:
          </p>
          <p style={{ fontSize: '14px', marginBottom: '4px' }}>
            ❌ ChatGPT nahi (woh bohot badi hai)
          </p>
          <p style={{ fontSize: '14px', marginBottom: '4px' }}>
            ❌ Google nahi (woh search karta hai)
          </p>
          <p style={{ fontSize: '14px' }}>
            ❌ Robot nahi (isme body nahi hai)
          </p>
        </div>

        <div
          style={{
            background: '#d1fae5',
            border: '2px solid #a7f3d0',
            borderRadius: '12px',
            padding: '14px',
            margin: '14px 0',
          }}
        >
          <p style={{ marginBottom: '8px', fontWeight: 700, color: '#065f46' }}>
            Yeh kya hai:
          </p>
          <p style={{ fontSize: '14px', marginBottom: '4px' }}>
            ✅ Ek chhoti si machine jo <b>pattern</b> pehchanti hai
          </p>
          <p style={{ fontSize: '14px', marginBottom: '4px' }}>
            ✅ Tum usay <b>examples</b> dogi — woh seekhe gi
          </p>
          <p style={{ fontSize: '14px' }}>
            ✅ Phir naya text dekhe gi toh bata degi &quot;yeh kaisa hai?&quot;
          </p>
        </div>

        <p>
          <b>Example:</b> Tum usay 50 udaas words sikhao gi. Phir koi naya
          sher likho gi — woh bata degi &quot;yeh udaas hai ya khushi?&quot;
        </p>

        <p
          style={{
            background: '#fef3c7',
            padding: '12px',
            borderRadius: '10px',
            fontSize: '14px',
            color: '#92400e',
            marginTop: '14px',
          }}
        >
          💡 Simple bhasha mein: <b>AI = example se seekhne wali machine</b>.
        </p>
      </div>
    </div>
  )
}

// ============================================================
// SABAQ 2: AI ka dimaag
// ============================================================
function Lesson2() {
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '60px' }}>🧠</div>
        <h2
          style={{
            fontSize: '26px',
            fontWeight: 900,
            color: '#9333ea',
            marginBottom: '6px',
          }}
        >
          Sabaq 2: AI ka dimaag
        </h2>
        <p style={{ color: '#6b7280', fontSize: '13px' }}>
          Yeh kese sochti hai?
        </p>
      </div>

      <div style={{ fontSize: '15px', lineHeight: 1.8, color: '#374151' }}>
        <p>
          Humari AI <b>HDC</b> use karti hai. Pura naam:{' '}
          <i>Hyperdimensional Computing</i>. Damti nahi — simple hai.
        </p>

        <h3
          style={{
            color: '#9333ea',
            fontSize: '16px',
            marginTop: '16px',
            marginBottom: '8px',
          }}
        >
          Step 1: Word ko number banao
        </h3>
        <p style={{ fontSize: '14px' }}>
          Har word ko 1024 <b>zeros aur ones</b> mein badalte hain.
        </p>
        <div
          style={{
            background: '#f3e8ff',
            border: '2px solid #e9d5ff',
            borderRadius: '10px',
            padding: '12px',
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#581c87',
            margin: '8px 0',
            wordBreak: 'break-all',
          }}
        >
          dard → 01101001 10110010 00101110 ... (1024 bits)
        </div>

        <h3
          style={{
            color: '#9333ea',
            fontSize: '16px',
            marginTop: '16px',
            marginBottom: '8px',
          }}
        >
          Step 2: Bundle (mila do)
        </h3>
        <p style={{ fontSize: '14px' }}>
          Bahut saare words ko mila do. Jaise: <i>dard + gham + tanhai + rota
          + udaas</i> = ek <b>&quot;Sad&quot; category</b> ban jati hai.
        </p>
        <div
          style={{
            background: '#f3e8ff',
            border: '2px solid #e9d5ff',
            borderRadius: '10px',
            padding: '12px',
            fontSize: '13px',
            color: '#581c87',
            margin: '8px 0',
            textAlign: 'center',
          }}
        >
          🔵 + 🔵 + 🔵 + 🔵 + 🔵 = <b>🔵 (Sad)</b>
        </div>

        <h3
          style={{
            color: '#9333ea',
            fontSize: '16px',
            marginTop: '16px',
            marginBottom: '8px',
          }}
        >
          Step 3: Compare (togr do)
        </h3>
        <p style={{ fontSize: '14px' }}>
          Ab tum naya sher likho gi. Uska vector banega. Phir har category se
          compare karenge — sabse similar hi jawab!
        </p>
        <div
          style={{
            background: '#fef3c7',
            border: '2px solid #fde68a',
            borderRadius: '10px',
            padding: '12px',
            fontSize: '13px',
            color: '#92400e',
            margin: '8px 0',
          }}
        >
          tumhara sher ↔ Sad (82% same) ✅<br />
          tumhara sher ↔ Romantic (45% same)<br />
          <b>Answer: Sad mood</b>
        </div>

        <p
          style={{
            background: '#fce7f3',
            padding: '12px',
            borderRadius: '10px',
            fontSize: '14px',
            color: '#9d174d',
            marginTop: '14px',
          }}
        >
          💡 Simple bhasha mein: <b>word → number → milao → compare</b>. Bas!
          GPU ki zaroorat nahi. CPU par chalti hai.
        </p>
      </div>
    </div>
  )
}

// ============================================================
// SABAQ 3: Data kahan save hota?
// ============================================================
function Lesson3() {
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '60px' }}>💾</div>
        <h2
          style={{
            fontSize: '26px',
            fontWeight: 900,
            color: '#10b981',
            marginBottom: '6px',
          }}
        >
          Sabaq 3: Data kahan save?
        </h2>
        <p style={{ color: '#6b7280', fontSize: '13px' }}>
          AI yaadash kahan rakhti hai?
        </p>
      </div>

      <div style={{ fontSize: '15px', lineHeight: 1.8, color: '#374151' }}>
        <p>
          Pehle humari AI <b>temporary</b> thi — refresh karte hi sab bhool
          jati thi. Ab humne usay <b>permanent</b> yaadash di hai.
        </p>

        <div
          style={{
            background: '#d1fae5',
            border: '2px solid #a7f3d0',
            borderRadius: '12px',
            padding: '14px',
            margin: '14px 0',
          }}
        >
          <p style={{ marginBottom: '8px', fontWeight: 700, color: '#065f46' }}>
            Yaadash kahan hai?
          </p>
          <div
            style={{
              background: 'white',
              padding: '10px 14px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '13px',
              color: '#065f46',
              wordBreak: 'break-all',
            }}
          >
            📁 db/custom.db
          </div>
          <p
            style={{
              fontSize: '13px',
              color: '#065f46',
              marginTop: '8px',
            }}
          >
            Yeh ek file hai — tumhare computer par. Internet par nahi.
          </p>
        </div>

        <h3
          style={{
            color: '#10b981',
            fontSize: '16px',
            marginTop: '16px',
            marginBottom: '8px',
          }}
        >
          Is file mein kya save hota?
        </h3>
        <p style={{ fontSize: '14px' }}>
          3 cheezein permanent save hoti hain:
        </p>
        <ul style={{ fontSize: '14px', paddingLeft: '22px', marginTop: '8px' }}>
          <li>
            <b>📦 Models</b> — jaise &quot;Poetry Brain&quot; (AI ka naam)
          </li>
          <li>
            <b>🏷️ Categories</b> — jaise &quot;Sad&quot;, &quot;Romantic&quot;
            (sikhayi hui classes)
          </li>
          <li>
            <b>📝 Training words</b> — jo words tumne sikhaye (jaise
            &quot;dard&quot;, &quot;gham&quot;)
          </li>
        </ul>

        <div
          style={{
            background: '#fef3c7',
            border: '2px solid #fde68a',
            borderRadius: '12px',
            padding: '14px',
            margin: '14px 0',
          }}
        >
          <p style={{ fontWeight: 700, color: '#92400e', marginBottom: '6px' }}>
            ⚠️ Kya matlab?
          </p>
          <p style={{ fontSize: '14px', color: '#92400e' }}>
            Browser band karo, refresh karo, kal aao — <b>sab data rahega</b>.
            Tumne jo sikhaya, woh AI hamesha yaad rakhe gi.
          </p>
        </div>

        <p
          style={{
            background: '#fce7f3',
            padding: '12px',
            borderRadius: '10px',
            fontSize: '14px',
            color: '#9d174d',
            marginTop: '14px',
          }}
        >
          💡 Simple bhasha mein: <b>database = AI ki diary</b>. Jo likha, woh
          hamesha rahega.
        </p>
      </div>
    </div>
  )
}

// ============================================================
// SABAQ 4: Kese use karogi?
// ============================================================
function Lesson4() {
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '60px' }}>🚀</div>
        <h2
          style={{
            fontSize: '26px',
            fontWeight: 900,
            color: '#f59e0b',
            marginBottom: '6px',
          }}
        >
          Sabaq 4: Kese use karu?
        </h2>
        <p style={{ color: '#6b7280', fontSize: '13px' }}>
          Mujhe kese chalau gi?
        </p>
      </div>

      <div style={{ fontSize: '15px', lineHeight: 1.8, color: '#374151' }}>
        <p>
          Tumhari AI <b>yahi</b> hai — jahan abhi dekh rahi ho. Tumhari screen
          par. Koi download nahi, koi install nahi.
        </p>

        <h3
          style={{
            color: '#f59e0b',
            fontSize: '16px',
            marginTop: '16px',
            marginBottom: '8px',
          }}
        >
          Kese kholo?
        </h3>
        <div
          style={{
            background: '#fef3c7',
            border: '2px solid #fde68a',
            borderRadius: '12px',
            padding: '14px',
            margin: '8px 0',
          }}
        >
          <p style={{ fontSize: '14px', color: '#92400e', marginBottom: '8px' }}>
            👉 <b>Preview Panel</b> — tumhari screen ke right side mein. Wahan
            &quot;Meri AI&quot; dikhe gi.
          </p>
          <p style={{ fontSize: '14px', color: '#92400e' }}>
            👉 <b>Open in New Tab</b> — Preview panel ke upar ek button hai.
            Usay dabao gi toh AI alag tab mein khul jayegi.
          </p>
        </div>

        <h3
          style={{
            color: '#f59e0b',
            fontSize: '16px',
            marginTop: '16px',
            marginBottom: '8px',
          }}
        >
          Abhi kya kar sakti ho?
        </h3>
        <p style={{ fontSize: '14px' }}>
          Abhi humne sirf <b>basic</b> banai hai. Tum sirf ye 4 sabaq padh
          sakti ho. Koi model nahi, koi training nahi.
        </p>

        <div
          style={{
            background: '#d1fae5',
            border: '2px solid #a7f3d0',
            borderRadius: '12px',
            padding: '14px',
            margin: '14px 0',
          }}
        >
          <p style={{ marginBottom: '8px', fontWeight: 700, color: '#065f46' }}>
            Aage kya hoga? (jab tum ready ho gi)
          </p>
          <p style={{ fontSize: '14px', color: '#065f46', marginBottom: '4px' }}>
            1. AI ka pehla model banaogi (jaise &quot;Poetry Mood Detector&quot;)
          </p>
          <p style={{ fontSize: '14px', color: '#065f46', marginBottom: '4px' }}>
            2. Categories banaogi (Sad, Romantic, Happy...)
          </p>
          <p style={{ fontSize: '14px', color: '#065f46', marginBottom: '4px' }}>
            3. Words sikhao gi (dard, gham, mohabbat...)
          </p>
          <p style={{ fontSize: '14px', color: '#065f46' }}>
            4. Apna sher likh kar AI se poochogi — &quot;yeh kaisa mood hai?&quot;
          </p>
        </div>

        <p
          style={{
            background: '#fce7f3',
            padding: '12px',
            borderRadius: '10px',
            fontSize: '14px',
            color: '#9d174d',
            marginTop: '14px',
          }}
        >
          💡 Simple bhasha mein: <b>Preview panel kholo → AI yahi khulti hai</b>.
          Jab ready ho, bolo &quot;model banao&quot; — hum agla step karenge.
        </p>

        <div
          style={{
            background: '#f3e8ff',
            border: '2px solid #e9d5ff',
            borderRadius: '12px',
            padding: '14px',
            marginTop: '16px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '6px' }}>🎉</div>
          <p
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: '#581c87',
            }}
          >
            Mubarak ho! Tumne AI ki basic samajh li.
          </p>
          <p
            style={{
              fontSize: '13px',
              color: '#6b7280',
              marginTop: '4px',
            }}
          >
            Ab tum ready ho agla step lene ke liye — jab bolo, hum model
            banayenge. 🌟
          </p>
        </div>
      </div>
    </div>
  )
}
