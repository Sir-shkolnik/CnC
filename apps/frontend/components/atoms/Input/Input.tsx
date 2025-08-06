import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'
import { AlertCircle, CheckCircle } from 'lucide-react'

const inputVariants = cva(
  'input transition-colors duration-200',
  {
    variants: {
      variant: {
        default: 'border-gray-600 focus:border-primary',
        error: 'border-error focus:border-error',
        success: 'border-success focus:border-success',
      },
      inputSize: {
        sm: 'h-8 px-2 text-sm',
        md: 'h-10 px-3',
        lg: 'h-12 px-4 text-lg',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
      fullWidth: true,
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string
  error?: string
  success?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  helperText?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    inputSize, 
    fullWidth, 
    label, 
    error, 
    success, 
    leftIcon, 
    rightIcon, 
    helperText, 
    id,
    ...props 
  }, ref) => {
    const inputId = id || `input-${React.useId()}`
    
    // Determine variant based on error/success states
    const inputVariant = error ? 'error' : success ? 'success' : variant

    return (
      <div className={cn('space-y-1', fullWidth && 'w-full')}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">
              {leftIcon}
            </div>
          )}
          
          <input
            id={inputId}
            className={cn(
              inputVariants({ variant: inputVariant, inputSize, fullWidth, className }),
              leftIcon && 'pl-10',
              (rightIcon || error || success) && 'pr-10'
            )}
            ref={ref}
            {...props}
          />
          
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {error && <AlertCircle className="h-4 w-4 text-error" />}
            {success && <CheckCircle className="h-4 w-4 text-success" />}
            {!error && !success && rightIcon && (
              <span className="text-text-secondary">{rightIcon}</span>
            )}
          </div>
        </div>
        
        {(error || success || helperText) && (
          <p className={cn(
            'text-sm',
            error && 'text-error',
            success && 'text-success',
            helperText && 'text-text-secondary'
          )}>
            {error || success || helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input, inputVariants } 