import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

interface Testimonial {
  name: string;
  role: string;
  image: string;
  alt: string;
  rating: number;
  text: string;
  plan: string;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard = ({ testimonial }: TestimonialCardProps) => {
  return (
    <div className="flex flex-col rounded-lg bg-card p-6 shadow-academic transition-academic hover:-translate-y-0.5 hover:shadow-academic-md">
      <div className="mb-4 flex items-center space-x-4">
        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-full">
          <AppImage
            src={testimonial.image}
            alt={testimonial.alt}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h4 className="font-caption text-sm font-semibold text-foreground">
            {testimonial.name}
          </h4>
          <p className="text-xs text-muted-foreground">{testimonial.role}</p>
          <span className="mt-1 inline-block rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
            {testimonial.plan}
          </span>
        </div>
      </div>

      <div className="mb-3 flex space-x-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <Icon
            key={index}
            name="StarIcon"
            size={16}
            variant={index < testimonial.rating ? 'solid' : 'outline'}
            className={
              index < testimonial.rating ? 'text-accent' : 'text-muted-foreground'
            }
          />
        ))}
      </div>

      <p className="text-sm italic text-muted-foreground">
        &ldquo;{testimonial.text}&rdquo;
      </p>
    </div>
  );
};

export default TestimonialCard;