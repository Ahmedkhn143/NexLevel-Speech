export const Skeleton = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => {
    return (
        <div
            className={`animate-pulse bg-gray-800 rounded-xl ${className}`}
            {...props}
        />
    );
};
