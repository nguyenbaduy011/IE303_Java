import { Award, GraduationCap } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function EduCertCard() {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-primary" />
          <h3 className="font-medium">Bachelor of Computer Science</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          University of Technology • 2015 - 2019
        </p>
        <p className="mt-1 text-sm">
          Graduated with honors, specializing in Software Engineering
        </p>
      </div>
      <Separator />
      <div>
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-primary" />
          <h3 className="font-medium">Project Management Professional (PMP)</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Project Management Institute • 2021
        </p>
        <p className="mt-1 text-sm">
          Certified project management professional
        </p>
      </div>
      <Separator />
      <div>
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-primary" />
          <h3 className="font-medium">Agile Scrum Master</h3>
        </div>
        <p className="text-sm text-muted-foreground">Scrum Alliance • 2020</p>
        <p className="mt-1 text-sm">
          Certified Scrum Master with focus on Agile methodologies
        </p>
      </div>
    </div>
  );
}
