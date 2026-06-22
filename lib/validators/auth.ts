import { z } from 'zod'

export const loginSchema = z.object({
  email:    z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(1, '비밀번호를 입력해 주세요'),
})

export const registerSchema = z.object({
  full_name: z.string().min(2, '이름은 2자 이상 입력해 주세요').max(50),
  email:     z.string().email('올바른 이메일 형식이 아닙니다'),
  password:  z.string()
    .min(8, '비밀번호는 8자 이상이어야 합니다')
    .regex(/[A-Za-z]/, '영문자를 포함해야 합니다')
    .regex(/[0-9]/,   '숫자를 포함해야 합니다'),
})

export type LoginInput    = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
