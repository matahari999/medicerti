import Link from 'next/link'
import { Building2, Calendar, Users, BarChart2, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatScore, getScoreBgColor, daysUntil } from '@/lib/utils'

interface HospitalCardProps {
  hospital: {
    id:                   string
    name:                 string
    region:               string | null
    bed_count:            number | null
    accreditation_target: string | null
    accreditation_cycle:  number
    role:                 string
  }
  score?:        number | null
  memberCount?:  number
}

export function HospitalCard({ hospital, score, memberCount }: HospitalCardProps) {
  const days = hospital.accreditation_target ? daysUntil(hospital.accreditation_target) : null

  return (
    <Link href={`/hospitals/${hospital.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-brand-600" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate group-hover:text-brand-700 transition-colors">
                  {hospital.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {hospital.region ?? '지역 미입력'} {hospital.bed_count ? `· ${hospital.bed_count}병상` : ''}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-brand-600 shrink-0 mt-1 transition-colors" />
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          {/* 준비도 점수 */}
          <div className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm font-medium ${
            score != null ? getScoreBgColor(score) : 'bg-gray-50 text-gray-500 border-gray-200'
          }`}>
            <div className="flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5" />
              <span>인증 준비도</span>
            </div>
            <span className="font-bold">{score != null ? formatScore(score) : '미분석'}</span>
          </div>

          {/* 메타 정보 */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {hospital.accreditation_target ? (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span className={days != null && days < 30 ? 'text-red-600 font-medium' : ''}>
                  {days != null && days > 0 ? `D-${days}` : days === 0 ? '오늘' : '기한 초과'}
                  {' '}({formatDate(hospital.accreditation_target)})
                </span>
              </div>
            ) : (
              <span>목표일 미설정</span>
            )}

            {memberCount != null && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{memberCount}명</span>
              </div>
            )}
          </div>

          <Badge variant="outline" className="text-xs">
            {hospital.accreditation_cycle}차 인증
          </Badge>
        </CardContent>
      </Card>
    </Link>
  )
}

