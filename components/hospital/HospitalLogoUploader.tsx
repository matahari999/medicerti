'use client'

import { useRef, useState } from 'react'
import { UploadCloud, Trash2, Loader2, ImageIcon } from 'lucide-react'

interface Props {
  hospitalId: string
  initialLogoUrl: string | null
}

// 업로드 이미지를 인쇄 서식에 내장할 수 있는 작은 data URL로 리사이즈한다.
// 로고 칸은 인쇄 시 최대 84x52px 정도라 240x140로 저장하면 화질·용량 모두 충분하다.
function resizeToDataUrl(file: File, maxW = 240, maxH = 140): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('파일을 읽지 못했습니다'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('이미지를 불러오지 못했습니다'))
      img.onload = () => {
        const scale = Math.min(maxW / img.width, maxH / img.height, 1)
        const w = Math.max(1, Math.round(img.width * scale))
        const h = Math.max(1, Math.round(img.height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('이미지 처리에 실패했습니다'))
        ctx.drawImage(img, 0, 0, w, h)
        // 투명 배경 유지를 위해 PNG 우선, 용량이 크면 흰 배경 JPEG로 대체
        let out = canvas.toDataURL('image/png')
        if (out.length > 180_000) {
          ctx.globalCompositeOperation = 'destination-over'
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, w, h)
          out = canvas.toDataURL('image/jpeg', 0.85)
        }
        resolve(out)
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

export function HospitalLogoUploader({ hospitalId, initialLogoUrl }: Props) {
  const [logo, setLogo] = useState<string | null>(initialLogoUrl)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function save(logo_url: string | null) {
    const res = await fetch(`/api/hospitals/${hospitalId}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ logo_url }),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => null)
      throw new Error(j?.error?.message || '저장에 실패했습니다')
    }
  }

  async function handleFile(file: File | undefined) {
    if (!file) return
    setError(null)
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있습니다.')
      return
    }
    setBusy(true)
    try {
      const dataUrl = await resizeToDataUrl(file)
      await save(dataUrl)
      setLogo(dataUrl)
    } catch (e) {
      setError(e instanceof Error ? e.message : '업로드에 실패했습니다')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleRemove() {
    setBusy(true)
    setError(null)
    try {
      await save(null)
      setLogo(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : '삭제에 실패했습니다')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        {/* 미리보기 */}
        <div className="w-28 h-16 shrink-0 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="병원 로고" className="max-w-full max-h-full object-contain" />
          ) : (
            <ImageIcon className="w-6 h-6 text-gray-300" />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-3 py-2"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              {logo ? '로고 변경' : '로고 업로드'}
            </button>
            {logo && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-60 text-gray-600 text-sm px-3 py-2"
              >
                <Trash2 className="w-4 h-4" />
                제거
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400">PNG·JPG 권장. 인쇄 서식·규정집 상단 로고 칸에 표시됩니다.</p>
        </div>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
