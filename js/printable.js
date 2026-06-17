// ============================================
// printable.js — PDF Activity Sheet Generator
// رحلة مصطفى — Mostafa's Journey
// Uses jsPDF loaded from CDN
// ============================================

const Printable = (() => {
  let jsPDFLoaded = false;
  let loadingPromise = null;

  // Load jsPDF from CDN
  function loadJsPDF() {
    if (jsPDFLoaded) return Promise.resolve();
    if (loadingPromise) return loadingPromise;

    loadingPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => {
        jsPDFLoaded = true;
        resolve();
      };
      script.onerror = () => {
        loadingPromise = null;
        reject(new Error('Failed to load jsPDF'));
      };
      document.head.appendChild(script);
    });

    return loadingPromise;
  }

  // Generate a printable PDF for a specific day
  async function generateDaySheet(dayData) {
    await loadJsPDF();

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // Colors
    const toffee = [217, 119, 6]; // #D97706
    const dark = [26, 26, 26]; // #1A1A1A
    const gray = [120, 120, 120];
    const lightBg = [250, 250, 250];

    // Helper: draw right-aligned text (for RTL)
    function drawRTLText(text, yPos, fontSize = 12, color = dark, align = 'right') {
      doc.setFontSize(fontSize);
      doc.setTextColor(...color);
      const x = align === 'right' ? pageWidth - margin : align === 'center' ? pageWidth / 2 : margin;
      doc.text(text, x, yPos, { align });
      return fontSize * 0.5; // approximate line height in mm
    }

    // Helper: draw a section box
    function drawBox(yStart, height, fillColor = lightBg) {
      doc.setFillColor(...fillColor);
      doc.roundedRect(margin, yStart, contentWidth, height, 3, 3, 'F');
    }

    // Helper: draw separator line
    function drawLine(yPos) {
      doc.setDrawColor(...toffee);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
    }

    // ===== HEADER =====
    drawBox(y, 25, [255, 248, 235]);
    y += 8;
    drawRTLText(`رحلة مصطفى — اليوم ${dayData.day}`, y, 18, toffee, 'center');
    y += 10;
    drawRTLText(`${dayData.letter.emoji} حرف ${dayData.letter.name} | رقم ${dayData.number.word} ${dayData.number.emoji} | لون ${dayData.color.name}`, y, 10, gray, 'center');
    y += 15;

    // ===== LETTER SECTION =====
    drawBox(y, 40);
    y += 8;
    drawRTLText('📝 حرف اليوم', y, 14, toffee);
    y += 10;

    // Big letter
    doc.setFontSize(48);
    doc.setTextColor(...dark);
    doc.text(dayData.letter.char, pageWidth / 2, y + 10, { align: 'center' });
    y += 20;

    drawRTLText(`${dayData.letter.name} — ${dayData.letter.word} ${dayData.letter.emoji}`, y, 12, dark, 'center');
    y += 18;

    // ===== NUMBER SECTION =====
    drawBox(y, 25);
    y += 8;
    drawRTLText('🔢 رقم اليوم', y, 14, toffee);
    y += 10;
    drawRTLText(`${dayData.number.value} — ${dayData.number.word} ${dayData.number.emoji}`, y, 14, dark, 'center');
    y += 15;

    // ===== COLOR & ANIMAL =====
    drawBox(y, 25);
    y += 8;
    drawRTLText(`🎨 اللون: ${dayData.color.name} | 🐾 الحيوان: ${dayData.animal.name} ${dayData.animal.emoji}`, y, 12, dark, 'center');
    y += 25;

    // ===== OFFLINE ACTIVITY =====
    drawBox(y, 55, [255, 248, 235]);
    y += 8;
    drawRTLText('🏠 نشاط بدون شاشة', y, 14, toffee);
    y += 8;
    drawRTLText(dayData.offlineActivity.title, y, 12, dark);
    y += 8;

    // Materials
    drawRTLText('المواد المطلوبة:', y, 10, gray);
    y += 6;
    dayData.offlineActivity.materials.forEach(mat => {
      drawRTLText(`• ${mat}`, y, 10, dark);
      y += 5;
    });
    y += 3;

    // Steps
    drawRTLText('الخطوات:', y, 10, gray);
    y += 6;
    dayData.offlineActivity.steps.forEach((step, i) => {
      const lines = doc.splitTextToSize(`${i + 1}. ${step}`, contentWidth - 10);
      lines.forEach(line => {
        drawRTLText(line, y, 9, dark);
        y += 5;
      });
    });
    y += 10;

    // ===== QURAN SECTION =====
    if (y + 30 > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    drawBox(y, 30, [240, 253, 244]);
    y += 8;
    drawRTLText('📖 القرآن الكريم', y, 14, [22, 101, 52]);
    y += 8;
    drawRTLText(`سورة ${dayData.quran.surah}`, y, 11, gray, 'center');
    y += 8;

    const quranLines = doc.splitTextToSize(dayData.quran.ayahs, contentWidth - 20);
    quranLines.forEach(line => {
      drawRTLText(line, y, 11, dark, 'center');
      y += 6;
    });
    y += 10;

    // ===== BEHAVIOR =====
    if (y + 20 > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    drawBox(y, 20);
    y += 8;
    drawRTLText(`🤝 مهارة اليوم: ${dayData.behavior.title}`, y, 12, toffee);
    y += 8;
    drawRTLText(dayData.behavior.description, y, 10, dark);
    y += 15;

    // ===== FOOTER =====
    drawLine(pageHeight - 15);
    drawRTLText('رحلة مصطفى — تعلم وإلعب 🧡', pageHeight - 10, 8, gray, 'center');

    // Save the PDF
    const profile = Storage.getActiveProfile();
    const childName = profile ? profile.name : 'مصطفى';
    doc.save(`رحلة_${childName}_يوم_${dayData.day}.pdf`);
  }

  // Generate graduation certificate
  async function generateCertificate(certData) {
    await loadJsPDF();

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 297;
    const pageHeight = 210;
    const margin = 20;

    // Background
    doc.setFillColor(255, 248, 235);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Border
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(3);
    doc.roundedRect(10, 10, pageWidth - 20, pageHeight - 20, 5, 5);

    // Inner border
    doc.setLineWidth(1);
    doc.roundedRect(15, 15, pageWidth - 30, pageHeight - 30, 3, 3);

    // Title
    doc.setFontSize(32);
    doc.setTextColor(217, 119, 6);
    doc.text('🎓 شهادة تخرج 🎓', pageWidth / 2, 50, { align: 'center' });

    // Subtitle
    doc.setFontSize(16);
    doc.setTextColor(120, 120, 120);
    doc.text('رحلة مصطفى — تعلم وإلعب', pageWidth / 2, 63, { align: 'center' });

    // Child name
    doc.setFontSize(28);
    doc.setTextColor(26, 26, 26);
    doc.text(`${certData.emoji} ${certData.name}`, pageWidth / 2, 90, { align: 'center' });

    // Achievement text
    doc.setFontSize(14);
    doc.setTextColor(26, 26, 26);
    doc.text(`أكمل ${certData.completedDays} يوم من رحلة التعلم واللعب`, pageWidth / 2, 108, { align: 'center' });
    doc.text(`وحصل على ${certData.achievements} من ${certData.totalAchievements} إنجاز`, pageWidth / 2, 118, { align: 'center' });

    // Encouragement
    doc.setFontSize(18);
    doc.setTextColor(217, 119, 6);
    doc.text('🌟 مبروك يا بطل! فخورين بيك أوي! 🌟', pageWidth / 2, 140, { align: 'center' });

    // Date
    doc.setFontSize(11);
    doc.setTextColor(120, 120, 120);
    doc.text(`التاريخ: ${certData.date}`, pageWidth / 2, 160, { align: 'center' });

    // Emojis decoration
    doc.setFontSize(20);
    doc.text('⭐ 🏆 🎉 📚 🌈', pageWidth / 2, 175, { align: 'center' });

    doc.save(`شهادة_تخرج_${certData.name}.pdf`);
  }

  // Check if jsPDF is available
  function isReady() {
    return jsPDFLoaded;
  }

  return {
    generateDaySheet,
    generateCertificate,
    isReady,
    loadJsPDF
  };
})();
