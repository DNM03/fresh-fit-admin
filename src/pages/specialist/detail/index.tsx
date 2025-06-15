import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import {
  Star,
  Languages,
  // DollarSign,
  Ban,
  Check,
  ArrowLeft,
  Shield,
  Clock,
  Mail,
  Phone,
  VenusAndMars,
  Calendar,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import specialistService from "@/services/specialist.service";
import { toast } from "sonner";

interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expirationDate: string | null;
  credentialUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  description: string;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  major: string;
  startYear: number;
  endYear: number;
  createdAt: string;
  updatedAt: string;
}

interface ExpertSkill {
  expertId: string;
  skillId: string;
  isMainSkill: boolean;
  skill: {
    id: string;
    name: string;
  };
}

interface SpecialistDetail {
  id: string;
  userId: string;
  fullName: string;
  specialization: string;
  experience_years: number;
  bio: string;
  rating: number;
  total_reviews: number;
  languages: string[];
  consultation_fee: string;
  certifications: Certification[];
  experiences: Experience[];
  educations: Education[];
  expertSkills: ExpertSkill[];
  createdAt: string;
  updatedAt: string;
  user?: {
    _id: string;
    avatar?: string;
    gender?: string;
    phoneNumber?: string;
    email?: string;
    date_of_birth?: string;
  };
}

export default function SpecialistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [specialist, setSpecialist] = useState<SpecialistDetail | null>(null);
  const [allSpecialists, setAllSpecialists] = useState<any[]>([]);
  const [, setUserStatus] = useState<any>(null);

  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [isUnbanDialogOpen, setIsUnbanDialogOpen] = useState(false);
  const [isBanned, setIsBanned] = useState(false);

  useEffect(() => {
    const fetchAllSpecialists = async () => {
      try {
        const response = await specialistService.getSpecialists({
          page: 1,
          limit: 100,
        });
        setAllSpecialists(response.data.data.experts || []);
      } catch (error) {
        console.error("Error fetching all specialists:", error);
      }
    };

    fetchAllSpecialists();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const fetchSpecialistDetails = async () => {
      try {
        setLoading(true);
        const response = await specialistService.getSpecialistById(id);
        const expertInfo = response.data.data.expertInfo;
        console.log("Fetched specialist details:", expertInfo);
        setSpecialist(expertInfo);

        if (expertInfo?.userId) {
          const matchingSpecialist = allSpecialists.find(
            (spec) => spec.userId === expertInfo.userId
          );
          if (matchingSpecialist) {
            console.log("Matching specialist found:", matchingSpecialist);
            setUserStatus(matchingSpecialist.user.status);
            setIsBanned(matchingSpecialist.user.status === "Ban");
          }
        }
      } catch (error) {
        console.error("Error fetching specialist details:", error);
        setError("Failed to load specialist details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialistDetails();
  }, [id, allSpecialists]);

  const handleBan = async () => {
    try {
      await specialistService.banSpecialist(specialist?.userId as string);
      setIsBanned(true);
      setIsBanDialogOpen(false);
      toast("The specialist has been banned successfully.");
    } catch (error) {
      console.error("Error banning specialist:", error);
      toast("Failed to ban specialist. Please try again.");
    }
  };

  const handleUnban = async () => {
    try {
      await specialistService.unbanSpecialist(specialist?.userId as string);
      setIsBanned(false);
      setIsUnbanDialogOpen(false);
      toast("The specialist has been unbanned successfully.");
    } catch (error) {
      console.error("Error unbanning specialist:", error);
      toast("Failed to unban specialist. Please try again.");
    }
  };

  // Format date helper
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Present";
    return format(parseISO(dateString), "MMM dd, yyyy");
  };

  // Format money helper
  // const formatMoney = (amount: string) => {
  //   const numAmount = parseFloat(amount);
  //   return new Intl.NumberFormat("en-US", {
  //     style: "currency",
  //     currency: "VND",
  //     maximumFractionDigits: 0,
  //   }).format(numAmount);
  // };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // Render loading state
  if (loading) {
    return <SpecialistDetailSkeleton />;
  }

  // Render error state
  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container px-4 py-6 space-y-6">
      {/* Header with navigation and actions */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Specialists
        </Button>

        <div className="flex space-x-2">
          {isBanned ? (
            <Button
              variant="outline"
              onClick={() => setIsUnbanDialogOpen(true)}
              className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
            >
              <Check className="mr-2 h-4 w-4" />
              Unban Specialist
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setIsBanDialogOpen(true)}
              className="bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
            >
              <Ban className="mr-2 h-4 w-4" />
              Ban Specialist
            </Button>
          )}
        </div>
      </div>

      {isBanned && (
        <Alert variant="destructive">
          <Ban className="h-4 w-4" />
          <AlertTitle>This specialist is banned</AlertTitle>
          <AlertDescription>
            This specialist has been banned and cannot accept new appointments.
          </AlertDescription>
        </Alert>
      )}

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar with personal details */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src={specialist?.user?.avatar} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {specialist?.fullName
                    ? getInitials(specialist.fullName)
                    : "SP"}
                </AvatarFallback>
              </Avatar>
              <CardTitle>{specialist?.fullName}</CardTitle>
              <CardDescription>{specialist?.specialization}</CardDescription>
              <div className="flex justify-center items-center mt-2">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span>
                  {specialist?.rating || 0} ({specialist?.total_reviews || 0}{" "}
                  reviews)
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{specialist?.user?.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{specialist?.user?.phoneNumber}</span>
                </div>
                <div className="flex items-center">
                  <VenusAndMars className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{specialist?.user?.gender || "Male"}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  {specialist?.user?.date_of_birth && (
                    <span>
                      {new Date(
                        specialist?.user?.date_of_birth
                      ).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    {specialist?.experience_years} years of experience
                  </span>
                </div>
                {/* <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    Fee: {formatMoney(specialist?.consultation_fee || "0")} per
                    session
                  </span>
                </div> */}
                <div className="flex items-start">
                  <Languages className="h-4 w-4 mr-2 text-muted-foreground mt-1" />
                  <div>
                    <span className="text-muted-foreground text-sm">
                      Languages:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {specialist?.languages.map((language) => (
                        <Badge key={language} variant="secondary">
                          {language}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-start">
                  <Shield className="h-4 w-4 mr-2 text-muted-foreground mt-1" />
                  <div>
                    <span className="text-muted-foreground text-sm">
                      Main Skills:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {specialist?.expertSkills
                        .filter((skill) => skill.isMainSkill)
                        .map((expertSkill) => (
                          <Badge key={expertSkill.skillId} variant="default">
                            {expertSkill.skill.name}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full">
                <Separator className="my-4" />
                <div className="text-sm text-muted-foreground">
                  <div className="flex justify-between mb-1">
                    <span>Registered:</span>
                    <span>
                      {specialist?.createdAt
                        ? formatDate(specialist.createdAt)
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last updated:</span>
                    <span>
                      {specialist?.updatedAt
                        ? formatDate(specialist.updatedAt)
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{specialist?.bio}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main content with tabs */}
        <div className="md:col-span-2">
          <Tabs defaultValue="experience">
            <TabsList className="w-full">
              <TabsTrigger value="experience" className="flex-1">
                Experience
              </TabsTrigger>
              <TabsTrigger value="education" className="flex-1">
                Education
              </TabsTrigger>
              <TabsTrigger value="certifications" className="flex-1">
                Certifications
              </TabsTrigger>
              <TabsTrigger value="skills" className="flex-1">
                Skills
              </TabsTrigger>
            </TabsList>

            {/* Experience Tab */}
            <TabsContent value="experience" className="space-y-4">
              {specialist?.experiences.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No experience records found.
                  </CardContent>
                </Card>
              ) : (
                specialist?.experiences.map((experience) => (
                  <Card key={experience.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {experience.position}
                          </CardTitle>
                          <CardDescription>
                            {experience.company}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {formatDate(experience.startDate)} -{" "}
                          {formatDate(experience.endDate)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {experience.description}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Education Tab */}
            <TabsContent value="education" className="space-y-4">
              {specialist?.educations.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No education records found.
                  </CardContent>
                </Card>
              ) : (
                specialist?.educations.map((education) => (
                  <Card key={education.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {education.institution}
                          </CardTitle>
                          <CardDescription>
                            {education.degree} in {education.major}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {education.startYear} - {education.endYear}
                        </Badge>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Certifications Tab */}
            <TabsContent value="certifications" className="space-y-4">
              {specialist?.certifications.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No certifications found.
                  </CardContent>
                </Card>
              ) : (
                specialist?.certifications.map((certification) => (
                  <Card key={certification.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {certification.name}
                          </CardTitle>
                          <CardDescription>
                            {certification.issuingOrganization}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {formatDate(certification.issueDate)}
                          {certification.expirationDate &&
                            ` - ${formatDate(certification.expirationDate)}`}
                        </Badge>
                      </div>
                    </CardHeader>
                    {certification.credentialUrl && (
                      <CardContent>
                        <a
                          href={certification.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View Credential
                        </a>
                      </CardContent>
                    )}
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Skills Tab */}
            <TabsContent value="skills">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Skills & Expertise</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-sm mb-2">Main Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {specialist?.expertSkills
                          .filter((skill) => skill.isMainSkill)
                          .map((expertSkill) => (
                            <Badge
                              key={expertSkill.skillId}
                              className="bg-primary"
                            >
                              {expertSkill.skill.name}
                            </Badge>
                          ))}
                        {specialist?.expertSkills.filter(
                          (skill) => skill.isMainSkill
                        ).length === 0 && (
                          <p className="text-sm text-muted-foreground">
                            No main skills specified.
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm mb-2">Other Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {specialist?.expertSkills
                          .filter((skill) => !skill.isMainSkill)
                          .map((expertSkill) => (
                            <Badge
                              key={expertSkill.skillId}
                              variant="secondary"
                            >
                              {expertSkill.skill.name}
                            </Badge>
                          ))}
                        {specialist?.expertSkills.filter(
                          (skill) => !skill.isMainSkill
                        ).length === 0 && (
                          <p className="text-sm text-muted-foreground">
                            No additional skills specified.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Ban Confirmation Dialog */}
      <AlertDialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ban Specialist</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to ban this specialist? They will no longer
              be able to accept new appointments and their profile will be
              hidden from users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBan}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Ban
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unban Confirmation Dialog */}
      <AlertDialog open={isUnbanDialogOpen} onOpenChange={setIsUnbanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unban Specialist</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unban this specialist? Their profile will
              be visible again and they will be able to accept new appointments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnban}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Unban
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Skeleton loader for the detail page
function SpecialistDetailSkeleton() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center">
                <Skeleton className="h-24 w-24 rounded-full" />
              </div>
              <Skeleton className="h-6 w-36 mx-auto mt-4" />
              <Skeleton className="h-4 w-48 mx-auto mt-2" />
              <Skeleton className="h-4 w-24 mx-auto mt-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full">
                <Separator className="my-4" />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full mt-2" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <div className="flex space-x-1 border-b mb-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-10 flex-1" />
            ))}
          </div>

          {[...Array(3)].map((_, i) => (
            <Card key={i} className="mb-4">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                  <Skeleton className="h-6 w-32" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
