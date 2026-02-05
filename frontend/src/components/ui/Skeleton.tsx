import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    shimmer?: boolean;
}

function Skeleton({
    className = '',
    shimmer = true,
    ...props
}: SkeletonProps) {
    return (
        <div
            className={`
                rounded-lg 
                bg-gradient-to-r from-[hsl(250,20%,12%)] via-[hsl(250,20%,16%)] to-[hsl(250,20%,12%)]
                ${shimmer ? 'animate-pulse bg-[length:200%_100%]' : ''}
                ${className}
            `}
            {...props}
        />
    )
}

export { Skeleton };
