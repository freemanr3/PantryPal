import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Recipe card skeleton that matches the actual layout
export const RecipeCardSkeleton = () => (
  <Card className="w-full overflow-hidden flex flex-col rounded-xl h-full">
    {/* Image skeleton */}
    <Skeleton className="h-60 sm:h-72 md:h-80 w-full" />
    
    {/* Content skeleton */}
    <CardContent className="flex flex-col flex-grow p-4 md:p-5 gap-3">
      {/* Title skeleton */}
      <Skeleton className="h-7 w-3/4" />
      
      {/* Tags skeleton */}
      <div className="flex flex-wrap gap-1.5">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
      
      {/* Stats grid skeleton */}
      <div className="grid grid-cols-4 gap-2 my-1 py-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <Skeleton className="w-5 h-5 md:w-6 md:h-6 mb-1 rounded" />
            <Skeleton className="h-4 w-12 mb-1" />
            <Skeleton className="h-5 w-10" />
          </div>
        ))}
      </div>
      
      {/* Nutrition skeleton */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center">
          <Skeleton className="w-5 h-5 mr-2 rounded" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex items-center">
          <Skeleton className="w-5 h-5 mr-2 rounded" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      
      {/* Description skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      
      {/* Button skeleton */}
      <Skeleton className="h-10 w-full mt-auto" />
    </CardContent>
  </Card>
);

// Recipe grid skeleton
export const RecipeGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <RecipeCardSkeleton key={i} />
    ))}
  </div>
);

// Carousel skeleton
export const CarouselSkeleton = () => (
  <div className="w-full max-w-3xl mx-auto">
    <div className="space-y-4">
      <RecipeCardSkeleton />
      <div className="flex justify-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </div>
  </div>
);

// Page header skeleton
export const PageHeaderSkeleton = () => (
  <div className="text-center mb-8">
    <Skeleton className="h-8 w-64 mx-auto mb-2" />
    <Skeleton className="h-4 w-96 mx-auto mb-4" />
    
    {/* Filter buttons skeleton */}
    <div className="flex justify-center flex-wrap gap-2 mt-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-16" />
      ))}
    </div>
  </div>
);

// Meal planner skeleton
export const MealPlannerSkeleton = () => (
  <div className="container mx-auto max-w-5xl p-4">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex items-center gap-2 mt-4 md:mt-0">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-32" />
      </div>
    </div>
    
    {/* Budget tracker skeleton */}
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-3 w-full" />
          <div className="grid grid-cols-3 gap-4 text-center">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-16 mx-auto mb-2" />
                <Skeleton className="h-6 w-12 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
    
    {/* Recipe grid skeleton */}
    <RecipeGridSkeleton count={4} />
  </div>
);

// Recipe detail skeleton
export const RecipeDetailSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Back button skeleton */}
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-10 w-20" />
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
      
      {/* Title and tags skeleton */}
      <div className="mb-8">
        <Skeleton className="h-10 w-3/4 mb-4" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-18" />
        </div>
      </div>
      
      {/* Image and metrics skeleton */}
      <div className="mb-8">
        <Skeleton className="aspect-video w-full rounded-lg mb-6" />
        
        <div className="grid grid-cols-3 gap-4 text-center">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="w-6 h-6 mx-auto mb-2" />
              <Skeleton className="h-4 w-16 mx-auto mb-1" />
              <Skeleton className="h-5 w-12 mx-auto" />
            </Card>
          ))}
        </div>
      </div>
      
      {/* Tabs skeleton */}
      <div className="mb-8">
        <div className="flex space-x-4 mb-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-20" />
        </div>
        
        <Card className="p-4">
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </Card>
      </div>
    </div>
  </div>
); 