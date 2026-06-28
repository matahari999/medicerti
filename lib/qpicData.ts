import { HospitalTypeKey } from './types';

export interface QpicItem {
  id: string;
  title: string;
  description?: string;
  content?: string;
  source: '의료기관평가인증원' | '건강보험심사평가원' | '보건복지부';
  hospitalTypes: (HospitalTypeKey | 'all')[];
  link?: string;
  fileSize?: string;
  date?: string;
}

export interface QpicCategoryData {
  laws: QpicItem[];
  templates: QpicItem[];
  news: QpicItem[];
}

export interface QpicData {
  qps: QpicCategoryData;
  im: QpicCategoryData;
  evaluation: QpicCategoryData;
}

export const QPIC_DATA: QpicData = {
  qps: {
    laws: [
      {
        id: 'qps-law-1',
        title: '환자안전법 제11조 및 제12조 (환자안전위원회 및 전담인력)',
        description: '일정 규모 이상의 의료기관에 대해 환자안전위원회 설치 및 환자안전 전담인력 배치 의무를 규정하고 있습니다.',
        source: '보건복지부',
        hospitalTypes: ['all'],
        link: 'https://www.law.go.kr/법령/환자안전법',
        date: '2025-12-30'
      },
      {
        id: 'qps-law-2',
        title: '환자안전법 시행규칙 제9조 (환자안전사고의 의무보고)',
        description: '의료기관에서 발생하는 중대한 환자안전사고(설명과 다른 수술/시술, 의약품 투여 오류 등)의 보건복지부 장관 의무 보고 기준을 명시합니다.',
        source: '보건복지부',
        hospitalTypes: ['nursing', 'psychiatric', 'rehabilitation', 'acute'],
        link: 'https://www.law.go.kr/법령/환자안전법시행규칙',
        date: '2026-01-15'
      },
      {
        id: 'qps-law-3',
        title: '의료법 제36조 및 시행규칙 제34조 (의료기관의 안전관리)',
        description: '의료기관의 시설, 안전 및 장비 관리 기준과 정기 점검의 법적 의무를 명시합니다.',
        source: '보건복지부',
        hospitalTypes: ['all'],
        link: 'https://www.law.go.kr/법령/의료법',
        date: '2025-08-20'
      }
    ],
    templates: [
      {
        id: 'qps-temp-1',
        title: '환자안전사고 자율 보고서 서식 및 작성 가이드',
        description: '원내 환자안전사고(낙상, 투약오류, 검사오류 등) 발생 시 기록하는 자율보고 표준 서식 및 항목별 가이드라인입니다.',
        source: '의료기관평가인증원',
        hospitalTypes: ['all'],
        fileSize: '45 KB',
        date: '2026-03-10'
      },
      {
        id: 'qps-temp-2',
        title: '요양/재활병원 특화 낙상위험도 평가도구(MFS) 및 점검표',
        description: '노인 및 재활 환자의 입원 시, 정기적(매주/매월) 낙상위험도 평가에 사용하는 표준 Morse Fall Scale 시트와 예방 활동 체크리스트입니다.',
        source: '의료기관평가인증원',
        hospitalTypes: ['nursing', 'rehabilitation', 'korean'],
        fileSize: '78 KB',
        date: '2026-02-18'
      },
      {
        id: 'qps-temp-3',
        title: 'FMEA (우형성 영향분석) 개선 활동 워크시트 및 사례집',
        description: '의료 오류를 선제적으로 분석하고 개선하기 위한 고장유형 영향분석(FMEA) 템플릿과 실제 요양/급성기 병원 수행 성공 사례가 포함되어 있습니다.',
        source: '의료기관평가인증원',
        hospitalTypes: ['nursing', 'acute'],
        fileSize: '124 KB',
        date: '2026-04-05'
      },
      {
        id: 'qps-temp-4',
        title: '투약오류 예방을 위한 High-Alert 약물 관리 점검 일지',
        description: '고위험 약물(고농도 전해질, 인슐린, 항응고제 등)의 보관, 2인 교차확인, 라벨링 관리를 위한 일일 안전 점검표 서식입니다.',
        source: '의료기관평가인증원',
        hospitalTypes: ['all'],
        fileSize: '35 KB',
        date: '2026-01-22'
      }
    ],
    news: [
      {
        id: 'qps-news-1',
        title: '2026년 환자안전통계연보 발표 및 주요 사고 유형 분석',
        description: '의료기관평가인증원에서 주관한 2025년도 환자안전사고 보고 데이터를 분석하여 낙상(45%)과 투약(32%) 관련 예방 대책을 당부했습니다.',
        source: '의료기관평가인증원',
        hospitalTypes: ['all'],
        date: '2026-05-12'
      },
      {
        id: 'qps-news-2',
        title: '환자안전 주의경보: 의약품 주입 펌프(Infusion Pump) 유속 설정 오류',
        description: '수술실 및 중환자실 등에서 다수 발생하는 주입 펌프 설정 오류 예방을 위해 3중 확인 및 주기적인 장비 캘리브레이션을 요청하는 경보입니다.',
        source: '의료기관평가인증원',
        hospitalTypes: ['acute', 'rehabilitation'],
        date: '2026-06-02'
      },
      {
        id: 'qps-news-3',
        title: '정신병원 입원환자 낙상 및 자·타해 예방을 위한 환자안전 가이드라인 배포',
        description: '정신과 폐쇄병동 및 개방병동 환경을 고려한 신체 억제대 사용 최소화 및 병실 시설 안전 표준 지침입니다.',
        source: '의료기관평가인증원',
        hospitalTypes: ['psychiatric'],
        date: '2026-04-25'
      }
    ]
  },
  im: {
    laws: [
      {
        id: 'im-law-1',
        title: '감염병의 예방 및 관리에 관한 법률 제26조 및 제27조',
        description: '의료기관 내부의 감염병 예방 관리 대책 수립과 법정 감염병 신고 의무(1급~4급)의 기한 및 보고 절차를 규정합니다.',
        source: '보건복지부',
        hospitalTypes: ['all'],
        link: 'https://www.law.go.kr/법령/감염병의예방및관리에관한법률',
        date: '2025-11-05'
      },
      {
        id: 'im-law-2',
        title: '의료법 제47조 (의료관련감염 예방)',
        description: '일정 병상 이상 의료기관의 감염관리위원회 설치, 감염관리실 운영 및 감염관리 전문 전담 인력 배치에 관한 상세 법적 의무를 명시합니다.',
        source: '보건복지부',
        hospitalTypes: ['all'],
        link: 'https://www.law.go.kr/법령/의료법',
        date: '2025-08-20'
      },
      {
        id: 'im-law-3',
        title: '의료법 시행규칙 [별표 4의3] 의료기관의 감염관리 기준',
        description: '의료기구의 소독·멸균법, 격리병실 설치 기준 및 세탁물 처리 요령에 대한 행정처분 동반 구체적 기준입니다.',
        source: '보건복지부',
        hospitalTypes: ['all'],
        link: 'https://www.law.go.kr/법령/의료법시행규칙',
        date: '2026-02-01'
      }
    ],
    templates: [
      {
        id: 'im-temp-1',
        title: '의료기관 감염관리 규정 표준 가이드북 (2026년 개정판)',
        description: '인증 평가 수검에 완벽 대비할 수 있도록 감염위원회 운영, 손위생, 무균술, 부위별 감염 예방 등 전반적인 가이드라인을 담은 표준 매뉴얼입니다.',
        source: '보건복지부',
        hospitalTypes: ['all'],
        fileSize: '3.2 MB',
        date: '2026-03-20'
      },
      {
        id: 'im-temp-2',
        title: '손위생 이행도 모니터링 관찰기록지 및 월별 집계표',
        description: 'WHO 손위생 5 Moments 기준에 부합하는 의료진(의사, 간호사, 치료사) 관찰 평가표 및 부서별 통계 산출을 위한 엑셀 가이드입니다.',
        source: '의료기관평가인증원',
        hospitalTypes: ['all'],
        fileSize: '54 KB',
        date: '2026-05-15'
      },
      {
        id: 'im-temp-3',
        title: '치과 외래 감염관리 및 멸균기(AutoClave) 생물학적 표지자(BI) 점검 일지',
        description: '치과 핸드피스 소독, 기구 개별 포장 멸균, 멸균기 작동 신뢰성 평가(화학적/생물학적 모니터링)를 위한 전용 대장입니다.',
        source: '의료기관평가인증원',
        hospitalTypes: ['dental'],
        fileSize: '41 KB',
        date: '2026-02-10'
      },
      {
        id: 'im-temp-4',
        title: '한방 탕전실 위생 및 침/부항 자재 멸균 소독 체크리스트',
        description: '원내 원외 탕전실의 조제대 위생 관리 및 침구류 일회용품 사용 여부, 부항 기구 소독 일지를 기록하는 한방 특화 서식입니다.',
        source: '의료기관평가인증원',
        hospitalTypes: ['korean'],
        fileSize: '48 KB',
        date: '2026-03-02'
      },
      {
        id: 'im-temp-5',
        title: '요양병원 격리실 감염관리 수칙 및 다제내성균(MDRO) 대응 일지',
        description: 'CRE, VRE, MRSA 등 접촉주의 격리환자 관리 지침, 개인보호구 착용 실태 점검 및 환경 소독 일지 표준 양식입니다.',
        source: '의료기관평가인증원',
        hospitalTypes: ['nursing'],
        fileSize: '65 KB',
        date: '2026-04-12'
      }
    ],
    news: [
      {
        id: 'im-news-1',
        title: '2026년 요양병원 감염예방·관리료 신정 기준 고시 개정 안내',
        description: '심평원 고시 제2026-45호에 따른 감염예방관리료 등급별 수가 청구 요건 및 전담 간호사 배치 비율 적용 유예 기간을 상세 안내합니다.',
        source: '건강보험심사평가원',
        hospitalTypes: ['nursing'],
        date: '2026-06-10'
      },
      {
        id: 'im-news-2',
        title: '카바페넴내성장내세균목(CRE) 감염증 신고 건수 증가에 따른 선제 감염관리 철저 당부',
        description: '전국 요양병원 및 급성기 병원을 대상으로 환자 이송 및 공동간병 환경에서의 접촉 주의와 손위생 관리를 철저히 점검할 것을 당부하였습니다.',
        source: '보건복지부',
        hospitalTypes: ['nursing', 'acute', 'rehabilitation'],
        date: '2026-05-28'
      },
      {
        id: 'im-news-3',
        title: '치과 및 일반 병·의원 1회용 의료용품 재사용 금지 특별 합동 점검 실시 계획 공고',
        description: '수액 세트, 일회용 침, 치과 임플란트 기구 등의 무단 재사용 및 멸균 미비에 대한 전국 의료기관 현장 조사가 6~7월 중 실시됩니다.',
        source: '보건복지부',
        hospitalTypes: ['dental', 'korean', 'acute'],
        date: '2026-05-18'
      }
    ]
  },
  evaluation: {
    laws: [
      {
        id: 'eval-law-1',
        title: '국민건강보험법 제47조의4 (요양급여 적정성 평가)',
        description: '심사평가원이 보건의료 서비스의 질 향상과 요양급여의 비용 효과성 분석을 위해 매년 적정성 평가를 시행하도록 규정한 모법입니다.',
        source: '보건복지부',
        hospitalTypes: ['all'],
        link: 'https://www.law.go.kr/법령/국민건강보험법',
        date: '2025-07-10'
      },
      {
        id: 'eval-law-2',
        title: '요양급여의 적정성 평가 및 요양급여비용의 가산·감산 기준 제4조',
        description: '적정성 평가 결과에 따라 우수 기관 또는 질 향상 기관에 가산수가를 지급하거나, 최하위 등급(5등급) 등에 가산 배제/감산하는 상세 요율 기준입니다.',
        source: '보건복지부',
        hospitalTypes: ['all'],
        link: 'https://www.law.go.kr/법령/요양급여의적정성평가및요양급여비용의가산·감산기준',
        date: '2025-10-12'
      }
    ],
    templates: [
      {
        id: 'eval-temp-1',
        title: '2026년도(2주기 4차) 요양병원 적정성 평가 조사표 작성 가이드',
        description: '구조 영역(의사/간호인력 수, 당직의사 배치) 및 진료 영역(일상생활수행능력 향상, 욕창 발생, 인지기능 검사) 세부 산출 가이드와 작성용 공백 서식입니다.',
        source: '건강보험심사평가원',
        hospitalTypes: ['nursing'],
        fileSize: '1.8 MB',
        date: '2026-03-05'
      },
      {
        id: 'eval-temp-2',
        title: '정신건강의학과 적정성 평가 지표 모니터링 시트',
        description: '정신과 입원 환자의 퇴원 후 외래 지속 방문율, 조현병 환자 항정신병 약물 처방률 등 지표 데이터를 자체 점검할 수 있는 대장 템플릿입니다.',
        source: '건강보험심사평가원',
        hospitalTypes: ['psychiatric'],
        fileSize: '112 KB',
        date: '2026-02-20'
      },
      {
        id: 'eval-temp-3',
        title: '급성기 뇌졸중 적정성 평가 대비 정맥내 혈전용해제(t-PA) 투여 시간 기록표',
        description: '응급실 내원 후 t-PA 투여 개시까지의 시간(Door-to-Needle Time) 등 핵심 진료 과정 지표를 누락 없이 로깅하기 위한 양식입니다.',
        source: '건강보험심사평가원',
        hospitalTypes: ['acute', 'rehabilitation'],
        fileSize: '68 KB',
        date: '2026-04-10'
      },
      {
        id: 'eval-temp-4',
        title: '치과 근관치료(신경치료) 적정성 평가 지표 점검 양식',
        description: '근관치료 전 방사선 촬영 시행률, 재치료율 등의 지표 분석과 심평원 청구 연동 누락을 방지하기 위한 점검 체크리스트입니다.',
        source: '건강보험심사평가원',
        hospitalTypes: ['dental'],
        fileSize: '38 KB',
        date: '2026-01-15'
      }
    ],
    news: [
      {
        id: 'eval-news-1',
        title: '2026년도 요양급여 적정성 평가 결과에 따른 환류(감산) 및 가산 적용 결과 발표',
        description: '심평원은 질 평가 결과 1등급(우수) 요양기관 120개소 가산 지급 및 하위 5등급에 대한 디인센티브 적용 내역을 기관별 통보 완료하였습니다.',
        source: '건강보험심사평가원',
        hospitalTypes: ['all'],
        date: '2026-05-30'
      },
      {
        id: 'eval-news-2',
        title: '제3차 재활의료기관(재활병원) 적정성 평가 추진계획 설명회 개최 안내',
        description: '지정 재활의료기관 및 관련 병원 청구 담당자를 대상으로 일상생활동작(FIM) 개선율 등 평가 지표 고도화 방향에 대한 온라인 설명회를 실시합니다.',
        source: '건강보험심사평가원',
        hospitalTypes: ['rehabilitation'],
        date: '2026-06-08'
      },
      {
        id: 'eval-news-3',
        title: '한방병원 적정성 평가 신규 도입 타당성 용역 착수 보고회 개최',
        description: '한의 물리치료 및 침술 영역의 건강보험 급여 적정 청구와 의료질 평가 지표 마련을 위한 한방병원 전용 적정성 평가 설계가 본격 시작되었습니다.',
        source: '건강보험심사평가원',
        hospitalTypes: ['korean'],
        date: '2026-05-22'
      }
    ]
  }
};
