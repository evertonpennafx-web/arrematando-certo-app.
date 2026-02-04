
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import React from 'react';

const buttonVariants = cva(
	'inline-flex items-center justify-center rounded-md text-sm font-bold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 tracking-wide uppercase',
	{
		variants: {
			variant: {
				default: 'bg-[#d4af37] text-black hover:bg-[#b8941f] shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] border border-[#d4af37]',
				destructive:
          'bg-black border border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-black',
				outline:
          'border border-[#d4af37] bg-black text-[#d4af37] hover:bg-[#d4af37] hover:text-black shadow-[0_0_10px_rgba(212,175,55,0.1)]',
				secondary:
          'bg-black text-white border border-gray-800 hover:border-[#d4af37] hover:text-[#d4af37]',
				ghost: 'hover:bg-[#d4af37]/10 hover:text-[#d4af37]',
				link: 'text-[#d4af37] underline-offset-4 hover:underline',
			},
			size: {
				default: 'h-10 px-6 py-2',
				sm: 'h-9 rounded-md px-3',
				lg: 'h-12 rounded-md px-8 text-base',
				icon: 'h-10 w-10',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	const Comp = asChild ? Slot : 'button';
	return (
		<Comp
			className={cn(buttonVariants({ variant, size, className }))}
			ref={ref}
			{...props}
		/>
	);
});
Button.displayName = 'Button';

export { Button, buttonVariants };
