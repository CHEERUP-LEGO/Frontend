import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Title from "../../components/common/Title";
import ReactMarkdown from "react-markdown";
import "./CompanyDetail.css";
import PurpleBtn from "../../components/common/PurpleBtn";

export default function CompanyDetail() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanyDetail = async () => {
      try {
        const response = await axios.get(`http://gateway-server-8072-dns:8072/jobbotdari/api/company/${companyId}`);
        setCompany(response.data.data.company);
        setNews(response.data.data.news);
      } catch (err) {
        setError("기업 정보를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyDetail();
  }, [companyId]);

  if (loading) return <p className="loading">로딩 중...</p>;
  if (error) return <p className="error">{error}</p>;

  // 커스텀 컴포넌트로 볼드체 앞에 압정 추가
  const CustomBold = ({ children }) => (
    <strong>
      📌 {children}
    </strong>
  );

  // 커스텀 컴포넌트로 목록 앞에 아이콘 추가
  const CustomListItem = ({ children }) => (
    <li style={{ marginBottom: "8px", listStyleType: "none" }}>
      ☑️ {children}
    </li>
  );
  
  // 기업 요약 정보 다운로드 함수
  const downloadDescription = () => {
    if (!company || !company.description) return;

    const blob = new Blob([company.description], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${company.name}_설명.txt`;
    document.body.appendChild(a);
    a.click();

    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="company-detail-container-wrapper">
      <div className="company-detail-container">
        <Title mainTitle2={company.name} />
        
        {/* 회사 설명 섹션 */}
        <div className="company-description">
          <ReactMarkdown
            components={{
              strong: CustomBold, // strong 태그를 커스터마이징
              li: CustomListItem, // 목록(li) 태그를 커스터마이징
            }}
          >
            {company.description}
          </ReactMarkdown>
          {/* 다운로드 버튼 추가 */}
          <div className="company-description-download">
            <PurpleBtn text="📥 설명 다운로드" onClick={downloadDescription} />
          </div>
        </div>

        {/* 기업 뉴스 섹션 */}
        <div className="company-news-section">
          <h2
            className="news-link"
            onClick={() => navigate(`/company/${companyId}/news`, { state: { company, news } })}
            style={{ cursor: "pointer", color: "#5d5a88"}}
          >
            ➕ {company.name} 기사 더 보기
          </h2>

          <div className="news-list" id="news-list">
            {news.slice(0, 3).map((item, index) => (
              <a
                key={index}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="news-item"
              >
                <h3>{item.title}</h3>
                <p className="news-date">{new Date(item.publishedDate).toLocaleDateString()}</p>
                <div style={{color:"#888"}}>자세히 보기 →</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
