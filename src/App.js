import React, { useState, useRef, useCallback } from 'react';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFileExcel, 
  faFileAlt, 
  faUpload, 
  faFilePdf, 
  faSpinner, 
  faCheckCircle,
  faExclamationTriangle,
  faBars,
  faTimes,
  faInfoCircle,
  faListAlt,
  faDownload,
  faEnvelope,
  faCopy,
  faArrowUp
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import logoPlaceholder from './Assets/Images/logo-placeholder.png';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { HashRouter } from 'react-router-dom';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <a href="/" onClick={(e) => { e.preventDefault(); window.location.reload(); }}>
          <FontAwesomeIcon icon={faFileAlt} /> ReportGen
        </a>
      </div>
      <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
        <ul>
          <li><a href="#generate" onClick={() => { toggleMenu(); closeMenu(); }}>Generate Report</a></li>
          <li><a href="#how-it-works" onClick={() => { toggleMenu(); closeMenu(); }}>How It Works</a></li>
          <li><a href="#contact" onClick={() => { toggleMenu(); closeMenu(); }}>Contact</a></li>
        </ul>
      </div>
      <div className="hamburger-menu" onClick={toggleMenu}>
        <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
      </div>
    </nav>
  );
}

function FileUpload({ onFileUpload }) {
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (file && allowedTypes.includes(file.type)) {
      setFileName(file.name);
      setError('');
      readExcel(file, onFileUpload);
    } else {
      setFileName('');
      setError('Please select a valid Excel file (.xlsx or .xls)');
      onFileUpload(null);
    }
  };

  const readExcel = (file, callback) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);
      callback(json);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="file-upload">
      <h2><FontAwesomeIcon icon={faFileExcel} /> Upload Excel File</h2>
      <div className="upload-area">
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="file-input"
        />
        <label htmlFor="file-input" className="file-input-label">
          <FontAwesomeIcon icon={faUpload} /> Choose File
        </label>
        {fileName && <p className="file-name">Selected file: {fileName}</p>}
        {error && <p className="error-message"><FontAwesomeIcon icon={faExclamationTriangle} /> {error}</p>}
      </div>
    </div>
  );
}

const classRanges = {
  'Pre-Primary': [
    'Language Activities',
    'Mathematical Activities',
    'Environmental Activities',
    'Psychomotor and Creative Activities',
    'Religious Education Activities',
    'Pre Braille Activities'
  ],
  'Lower Primary': [
    'Literacy Activities',
    'Kiswahili Language',
    'English Language',
    'Mathematics',
    'Environmental',
    'Hygiene and Nutrition',
    'Religious Education',
    'Movement and Creative Activities'
  ],
  'Upper Primary': [
    'English',
    'Kiswahili',
    'Home Science',
    'Agriculture',
    'Science and Technology',
    'Mathematics',
    'Religious Education',
    'Creative Arts',
    'Physical and Health Education',
    'Social Studies'
  ],
  'Junior Secondary': [
    'English',
    'Kiswahili',
    'Mathematics',
    'Integrated Science',
    'Health Education',
    'Pre-Technical and Pre-Career Education',
    'Social Studies',
    'Religious Education',
    'Business Studies',
    'Agriculture',
    'Life Skills',
    'Sports and Physical Education'
  ]
};

function ClassRangeSelector({ onClassRangeChange }) {
  return (
    <div className="class-range-selector">
      <select onChange={(e) => onClassRangeChange(e.target.value)}>
        <option value="">Select Class Range</option>
        {Object.keys(classRanges).map((range) => (
          <option key={range} value={range}>{range}</option>
        ))}
      </select>
    </div>
  );
}

function ReportGenerator({ data, schoolInfo, classRange }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const pdfRef = useRef(null);

  const generateAllReports = useCallback(async () => {
    setIsGenerating(true);
    const pdf = new jsPDF();

    for (let i = 0; i < data.length; i++) {
      if (i > 0) pdf.addPage();
      await addReportToPDF(pdf, data[i], schoolInfo, classRange);
    }

    setIsGenerating(false);
    pdfRef.current = pdf;
    setShowPopup(true);
  }, [data, schoolInfo, classRange]);

  const downloadReports = useCallback(() => {
    setIsDownloading(true);
    setTimeout(() => {
      pdfRef.current.save('all_reports.pdf');
      setIsDownloading(false);
    }, 1000);
  }, []);

  const closePopup = useCallback(() => {
    setShowPopup(false);
  }, []);

  return (
    <div className="report-generator">
      <h2><FontAwesomeIcon icon={faFileAlt} /> Generate Reports</h2>
      <div className="report-buttons">
        <button onClick={generateAllReports} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin /> Generating Reports...
            </>
          ) : (
            'Generate All Reports'
          )}
        </button>
        {pdfRef.current && (
          <button onClick={downloadReports} disabled={isDownloading} className="download-btn">
            {isDownloading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin /> Downloading...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faFilePdf} /> Download All Reports
              </>
            )}
          </button>
        )}
      </div>
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <FontAwesomeIcon icon={faCheckCircle} className="success-icon" />
            <p>Reports generated successfully!</p>
            <button onClick={closePopup}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

async function addReportToPDF(pdf, data, schoolInfo, classRange) {
  const subjects = classRanges[classRange] || [];

  // Add logo
  const img = new Image();
  img.src = logoPlaceholder;
  await new Promise((resolve) => {
    img.onload = resolve;
  });
  const imgWidth = 40;
  const imgHeight = 40;
  const pageWidth = pdf.internal.pageSize.width;
  pdf.addImage(img, 'PNG', (pageWidth - imgWidth) / 2, 10, imgWidth, imgHeight);

  // Add header
  pdf.setFontSize(18);
  pdf.text('Ministry of Education', pageWidth / 2, 60, { align: 'center' });
  pdf.setFontSize(14);
  pdf.text(schoolInfo.schoolName || 'School Name', pageWidth / 2, 70, { align: 'center' });
  pdf.setFontSize(12);
  pdf.text('Student Academic Report', pageWidth / 2, 80, { align: 'center' });

  // Add student info
  pdf.setFontSize(10);
  pdf.text(`Name: ${data.Name}`, 20, 95);
  pdf.text(`Assessment Number: ${data['Assessment Number']}`, 20, 102);
  pdf.text(`Grade: ${schoolInfo.grade || 'N/A'}`, 120, 95);
  pdf.text(`Term: ${schoolInfo.term || 'N/A'}`, 120, 102);
  pdf.text(`Year: ${schoolInfo.year || 'N/A'}`, 120, 109);

  // Add academic performance table
  const tableData = subjects.map(subject => [
    subject,
    data[subject] || 'N/A',
    getPerformanceLevel(data[subject] || 0)
  ]);

  pdf.autoTable({
    startY: 115,
    head: [['Subject', 'Marks', 'Performance Level']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [242, 242, 242] },
  });

  // Add overall performance
  const finalY = pdf.lastAutoTable.finalY + 10;
  pdf.text(`Overall Performance Level: ${getOverallPerformanceLevel(data, subjects)}`, 20, finalY);
  pdf.text(`Position: ${data.Position || 'N/A'}`, 20, finalY + 7);

  // Add remarks
  pdf.text('Class Teacher\'s Comments:', 20, finalY + 20);
  const remarks = `${data.Name} has shown ${getOverallPerformanceLevel(data, subjects).toLowerCase()} performance this term. ${getOverallPerformanceLevel(data, subjects) === 'Exceeding Expectation' ? 'Keep up the excellent work!' : 'There is room for improvement in certain subjects. With continued effort and focus, better results can be achieved.'}`;
  pdf.setFontSize(9);
  pdf.text(remarks, 20, finalY + 27, { maxWidth: 170 });

  // Add footer
  pdf.text(`Opening Date: ${schoolInfo.openingDate || 'N/A'}`, 20, 270);
  pdf.text(`Closing Date: ${schoolInfo.closingDate || 'N/A'}`, 120, 270);
  pdf.text('Class Teacher\'s Signature: ____________________', 20, 280);
  pdf.text('Date: ____________________', 120, 280);
}

function getOverallPerformanceLevel(data, subjects) {
  const validMarks = subjects.map(subject => data[subject]).filter(mark => !isNaN(mark));
  const average = validMarks.reduce((sum, mark) => sum + mark, 0) / validMarks.length;
  return getPerformanceLevel(average);
}

function getPerformanceLevel(marks) {
  if (marks >= 76) return 'Exceeding Expectation';
  if (marks >= 51) return 'Meeting Expectation';
  if (marks >= 26) return 'Approaching Expectation';
  return 'Below Expectation';
}

function SchoolInfoInput({ onInfoChange }) {
  return (
    <div className="school-info-input">
      <div className="input-group">
        <label htmlFor="schoolName">School Name</label>
        <input
          id="schoolName"
          type="text"
          onChange={(e) => onInfoChange('schoolName', e.target.value)}
        />
      </div>
      <div className="input-group">
        <label htmlFor="grade">Grade</label>
        <input
          id="grade"
          type="text"
          onChange={(e) => onInfoChange('grade', e.target.value)}
        />
      </div>
      <div className="input-group">
        <label htmlFor="term">Term</label>
        <input
          id="term"
          type="text"
          onChange={(e) => onInfoChange('term', e.target.value)}
        />
      </div>
      <div className="input-group">
        <label htmlFor="year">Year</label>
        <input
          id="year"
          type="text"
          onChange={(e) => onInfoChange('year', e.target.value)}
        />
      </div>
      <div className="input-group">
        <label htmlFor="openingDate">Opening Date</label>
        <input
          id="openingDate"
          type="date"
          onChange={(e) => onInfoChange('openingDate', e.target.value)}
        />
      </div>
      <div className="input-group">
        <label htmlFor="closingDate">Closing Date</label>
        <input
          id="closingDate"
          type="date"
          onChange={(e) => onInfoChange('closingDate', e.target.value)}
        />
      </div>
    </div>
  );
}

function FormatInstructions() {
  const handleDownload = () => {
    fetch(`${process.env.PUBLIC_URL || ''}/Formats/report_templates.zip`)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'report_templates.zip';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => alert('Download failed. Please try again.'));
  };

  return (
    <div className="format-instructions">
      <h2><FontAwesomeIcon icon={faExclamationTriangle} /> Important: File Format Instructions</h2>
      <p>To ensure the report generator works correctly, please follow the format specified for each class range. You can download the templates for all class ranges below:</p>
      <button onClick={handleDownload} className="download-format-btn">
        <FontAwesomeIcon icon={faFileExcel} /> Download All Templates (ZIP)
      </button>
      <p>The ZIP file contains Excel templates for Pre-Primary, Lower Primary, Upper Primary, and Junior Secondary formats.</p>
      <p><strong>Please ensure your Excel file matches the format of the appropriate template before uploading.</strong></p>
    </div>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="how-it-works">
      <h2>How It Works</h2>
      <div className="card-container">
        <div className="card">
          <FontAwesomeIcon icon={faUpload} className="card-icon" />
          <h3>1. Upload Excel File</h3>
          <p>Start by uploading your Excel file containing student data. Make sure it follows the provided template format.</p>
        </div>
        <div className="card">
          <FontAwesomeIcon icon={faInfoCircle} className="card-icon" />
          <h3>2. Enter School Information</h3>
          <p>Fill in the school details, including name, grade, term, and relevant dates for the academic period.</p>
        </div>
        <div className="card">
          <FontAwesomeIcon icon={faListAlt} className="card-icon" />
          <h3>3. Select Class Range</h3>
          <p>Choose the appropriate class range for your students (e.g., Pre-Primary, Lower Primary, etc.).</p>
        </div>
        <div className="card">
          <FontAwesomeIcon icon={faFileAlt} className="card-icon" />
          <h3>4. Generate Reports</h3>
          <p>Click the "Generate All Reports" button to create individual student reports based on the uploaded data.</p>
        </div>
        <div className="card">
          <FontAwesomeIcon icon={faDownload} className="card-icon" />
          <h3>5. Download Reports</h3>
          <p>Once generated, you can download all reports as a single PDF file for easy distribution and printing.</p>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const email = 'machariajulius255@gmail.com';
  const whatsapp = '+254743427926';

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`${type} copied to clipboard!`);
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  return (
    <section id="contact" className="contact">
      <h2>Contact Us</h2>
      <div className="contact-buttons">
        <button onClick={() => copyToClipboard(email, 'Email')} className="contact-btn email-btn">
          <FontAwesomeIcon icon={faEnvelope} /> Email
          <FontAwesomeIcon icon={faCopy} className="copy-icon" />
        </button>
        <button onClick={() => copyToClipboard(whatsapp, 'WhatsApp number')} className="contact-btn whatsapp-btn">
          <FontAwesomeIcon icon={faWhatsapp} /> WhatsApp
          <FontAwesomeIcon icon={faCopy} className="copy-icon" />
        </button>
      </div>
    </section>
  );
}

function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="#generate">Generate Report</a></li>
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <p>&copy; 2023 Julius Macharia. All rights reserved.</p>
        </div>
      </div>
      <button className="back-to-top" onClick={scrollToTop}>
        <FontAwesomeIcon icon={faArrowUp} />
      </button>
    </footer>
  );
}

function App() {
  const [uploadedData, setUploadedData] = useState(null);
  const [schoolInfo, setSchoolInfo] = useState({});
  const [classRange, setClassRange] = useState('');

  const handleFileUpload = (data) => {
    setUploadedData(data);
  };

  const handleSchoolInfoChange = (field, value) => {
    setSchoolInfo(prevInfo => ({ ...prevInfo, [field]: value }));
  };

  const handleClassRangeChange = (range) => {
    setClassRange(range);
    setUploadedData(null);
  };

  return (
    <div className="App">
      <Navbar />
      <main>
        <section id="generate">
          <h1>Student Report Generator</h1>
          <FormatInstructions />
          <SchoolInfoInput onInfoChange={handleSchoolInfoChange} />
          <ClassRangeSelector onClassRangeChange={handleClassRangeChange} />
          {classRange && <FileUpload onFileUpload={handleFileUpload} />}
          {uploadedData && (
            <ReportGenerator 
              data={uploadedData} 
              schoolInfo={schoolInfo} 
              classRange={classRange} 
            />
          )}
        </section>
        <HowItWorks />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;