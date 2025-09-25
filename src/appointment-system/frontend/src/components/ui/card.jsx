import * as React from "react";

// Simple utility function for classnames
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "bg-white border border-gray-200 rounded-lg shadow-sm",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }) {
  return (
    <div
      className={cn(
        "px-6 py-4 border-b border-gray-200",
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn("text-lg font-semibold text-gray-900", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }) {
  return (
    <div
      className={cn("px-6 py-4", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 pb-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};