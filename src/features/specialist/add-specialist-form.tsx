import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { CalendarIcon, PlusCircle, Trash2, Upload, X } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import specialistService from "@/services/specialist.service";
import mediaService from "@/services/media.service";
import { toast } from "sonner";

const certificationSchema = z.object({
  name: z.string().min(1, "Certification name is required"),
  issuingOrganization: z.string().min(1, "Issuing organization is required"),
  issueDate: z.date({ required_error: "Issue date is required" }),
  expirationDate: z.date().nullable().optional(),
  credentialUrl: z.string().nullable().optional(),
});

const experienceSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position is required"),
  description: z.string().min(1, "Description is required"),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date().nullable().optional(),
});

const educationSchema = z.object({
  institution: z.string().min(1, "Institution name is required"),
  degree: z.enum(["ASSOCIATE", "BACHELOR", "MASTER", "DOCTORATE"]),
  major: z.string().min(1, "Major is required"),
  startYear: z
    .number()
    .min(1950, "Start year must be after 1950")
    .max(new Date().getFullYear(), "Start year cannot be in the future"),
  endYear: z.number().nullable().optional(),
});

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().min(9, "Please enter a valid phone number"),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  dateOfBirth: z.date({
    required_error: "Please select a date of birth",
  }),
  gender: z.string().min(1, "Please select a gender"),
  specialization: z.string().min(1, "Specialization is required"),
  experienceYears: z
    .number()
    .min(0, "Experience years must be a positive number"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  certifications: z
    .array(certificationSchema)
    .min(1, "At least one certification is required"),
  languages: z.array(z.string()).min(1, "At least one language is required"),
  consultationFee: z.number().min(0, "Fee must be a positive number"),
  mainSkills: z.array(z.string()).min(1, "At least one skill is required"),
  experiences: z.array(experienceSchema),
  educations: z
    .array(educationSchema)
    .min(1, "At least one education entry is required"),
});

const specializations = [
  "Cardiology Specialist",
  "Dermatology Specialist",
  "Endocrinology Specialist",
  "Gastroenterology Specialist",
  "Neurology Specialist",
  "Obstetrics Specialist",
  "Oncology Specialist",
  "Ophthalmology Specialist",
  "Orthopedics Specialist",
  "Pediatrics Specialist",
  "Psychiatry Specialist",
  "Radiology Specialist",
  "Urology Specialist",
  "General Practice Specialist",
  "Nutrition Specialist",
  "Fitness Specialist",
  "Wellness Specialist",
];

const languages = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Russian",
  "Chinese",
  "Japanese",
  "Korean",
  "Vietnamese",
  "Thai",
  "Hindi",
  "Arabic",
];

type FormValues = z.infer<typeof formSchema>;

function AddSpecialistForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skills, setSkills] = useState<any>([]);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await specialistService.getSkills();
        setSkills(response.data.data.skills || []);
      } catch (error) {
        console.error("Error fetching skills:", error);
      }
    };

    fetchSkills();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      phoneNumber: "",
      fullName: "",
      gender: "",
      specialization: "",
      experienceYears: undefined,
      bio: "",
      consultationFee: undefined,
      certifications: [
        {
          name: "",
          issuingOrganization: "",
          issueDate: new Date(),
          expirationDate: null,
          credentialUrl: null,
        },
      ],
      languages: [],
      mainSkills: [],
      experiences: [],
      educations: [
        {
          institution: "",
          degree: "BACHELOR",
          major: "",
          startYear: new Date().getFullYear() - 4,
          endYear: new Date().getFullYear(),
        },
      ],
    },
  });

  const {
    fields: certificationFields,
    append: appendCertification,
    remove: removeCertification,
  } = useFieldArray({
    name: "certifications",
    control: form.control,
  });

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
  } = useFieldArray({
    name: "experiences",
    control: form.control,
  });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({
    name: "educations",
    control: form.control,
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
      setProfileImageFile(file);
    }
  };

  const handleLanguageSelect = (language: string) => {
    if (selectedLanguages.includes(language)) {
      setSelectedLanguages(selectedLanguages.filter((l) => l !== language));
    } else {
      setSelectedLanguages([...selectedLanguages, language]);
    }
    form.setValue("languages", [...selectedLanguages, language]);
  };

  const handleRemoveLanguage = (language: string) => {
    const updated = selectedLanguages.filter((l) => l !== language);
    setSelectedLanguages(updated);
    form.setValue("languages", updated);
  };

  const handleSkillSelect = (skillId: string) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skillId));
    } else {
      setSelectedSkills([...selectedSkills, skillId]);
    }
    form.setValue("mainSkills", [...selectedSkills, skillId]);
  };

  const handleRemoveSkill = (skillId: string) => {
    const updated = selectedSkills.filter((s) => s !== skillId);
    setSelectedSkills(updated);
    form.setValue("mainSkills", updated);
  };

  // Helper function to convert all Date objects to ISO strings
  const convertDatesToISOStrings = (obj: any): any => {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (obj instanceof Date) {
      return obj.toISOString();
    }

    if (typeof obj === "object") {
      if (Array.isArray(obj)) {
        return obj.map((item) => convertDatesToISOStrings(item));
      }

      const result: any = {};
      for (const key in obj) {
        result[key] = convertDatesToISOStrings(obj[key]);
      }
      return result;
    }

    return obj;
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const valuesWithDatesConverted = convertDatesToISOStrings(values);
      let imageRes;
      if (profileImageFile) {
        imageRes = await mediaService.backupUploadImage(profileImageFile!);
      }

      const dataToSubmit = {
        ...valuesWithDatesConverted,
        avatar:
          imageRes?.result?.url ||
          "https://i.pinimg.com/736x/77/19/21/771921cf4e62ae9fa505645ccd2cbe76.jpg",
      };

      console.log("Form values:", dataToSubmit);
      const response = await specialistService.addSpecialist(dataToSubmit);
      console.log("Specialist created:", response.data);

      toast.success("Specialist account created successfully", {
        style: {
          background: "#3ac76b",
          color: "#fff",
        },
      });
    } catch (error: unknown) {
      console.error("Error creating specialist account:", error);
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "status" in error.response &&
        error.response.status === 400
      ) {
        toast.error("Email already exists.", {
          style: {
            background: "#cc3131",
            color: "#fff",
          },
        });
      } else {
        toast.error("Failed to create specialist account. Please try again.", {
          style: {
            background: "#cc3131",
            color: "#fff",
          },
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Specialist Account</h1>
        <p className="text-muted-foreground mt-2">
          Add a new health and wellness specialist to the system
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Personal Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Enter the specialist's basic information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200 mb-4">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center">
                  <label htmlFor="profile-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <Upload size={16} />
                      <span>Upload photo</span>
                    </div>
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Birth</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${
                                !field.value ? "text-muted-foreground" : ""
                              }`}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1940-01-01")
                            }
                            initialFocus
                            defaultMonth={new Date(2000, 0)}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="097722333"
                          {...field}
                          type="tel"
                          pattern="[0-9]*"
                          onKeyPress={(event) => {
                            if (!/[0-9]/.test(event.key)) {
                              event.preventDefault();
                            }
                          }}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, "");
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="specialist@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Professional Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
              <CardDescription>
                Enter the specialist's professional details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="specialization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialization</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select specialization" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {specializations.map((spec) => (
                            <SelectItem key={spec} value={spec}>
                              {spec}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experienceYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Experience</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                          placeholder="e.g., 5"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="consultationFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consultation Fee (VND)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="10000"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                          placeholder="e.g., 200000"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biography</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Professional background and expertise..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Skills and Languages Card */}
          <Card>
            <CardHeader>
              <CardTitle>Skills & Languages</CardTitle>
              <CardDescription>
                Add specialist's skills and spoken languages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <FormItem>
                  <FormLabel>Main Skills</FormLabel>
                  <div className="border rounded-md p-4">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedSkills.map((skillId) => {
                        const skillName =
                          skills.find((s: any) => s.id === skillId)?.name ||
                          skillId;
                        return (
                          <Badge
                            key={skillId}
                            className="flex items-center gap-1 px-3 py-1"
                          >
                            {skillName}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skillId)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X size={14} />
                            </button>
                          </Badge>
                        );
                      })}
                      {selectedSkills.length === 0 && (
                        <div className="text-sm text-muted-foreground">
                          No skills selected
                        </div>
                      )}
                    </div>

                    <Separator className="my-4" />

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {skills.map((skill: any) => (
                        <Button
                          key={skill.id}
                          type="button"
                          variant={
                            selectedSkills.includes(skill.id)
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => handleSkillSelect(skill.id)}
                          className="justify-start"
                        >
                          {skill.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>

                <FormItem>
                  <FormLabel>Languages</FormLabel>
                  <div className="border rounded-md p-4">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedLanguages.map((lang) => (
                        <Badge
                          key={lang}
                          className="flex items-center gap-1 px-3 py-1"
                        >
                          {lang}
                          <button
                            type="button"
                            onClick={() => handleRemoveLanguage(lang)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X size={14} />
                          </button>
                        </Badge>
                      ))}
                      {selectedLanguages.length === 0 && (
                        <div className="text-sm text-muted-foreground">
                          No languages selected
                        </div>
                      )}
                    </div>

                    <Separator className="my-4" />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {languages.map((lang) => (
                        <Button
                          key={lang}
                          type="button"
                          variant={
                            selectedLanguages.includes(lang)
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => handleLanguageSelect(lang)}
                          className="justify-start"
                        >
                          {lang}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              </div>
            </CardContent>
          </Card>

          {/* Certifications Card */}
          <Card>
            <CardHeader>
              <CardTitle>Certifications</CardTitle>
              <CardDescription>
                Add specialist's professional certifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {certificationFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-md relative">
                  <div className="absolute right-2 top-2">
                    {certificationFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCertification(index)}
                        className="h-8 w-8 text-destructive"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <FormField
                      control={form.control}
                      name={`certifications.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Certification Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Certified Dermatologist"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`certifications.${index}.issuingOrganization`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Issuing Organization</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., American Academy of Dermatology"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name={`certifications.${index}.issueDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Issue Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={`w-full pl-3 text-left font-normal ${
                                    !field.value ? "text-muted-foreground" : ""
                                  }`}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date > new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`certifications.${index}.expirationDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiration Date (Optional)</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={`w-full pl-3 text-left font-normal ${
                                    !field.value ? "text-muted-foreground" : ""
                                  }`}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>No expiration date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value || undefined}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                              <div className="p-3 border-t border-border">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="w-full justify-center text-sm"
                                  onClick={() =>
                                    form.setValue(
                                      `certifications.${index}.expirationDate`,
                                      null
                                    )
                                  }
                                >
                                  Clear (No Expiration)
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mt-4">
                    <FormField
                      control={form.control}
                      name={`certifications.${index}.credentialUrl`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Credential URL (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://credentials.example.com/verify/..."
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() =>
                  appendCertification({
                    name: "",
                    issuingOrganization: "",
                    issueDate: new Date(),
                    expirationDate: null,
                    credentialUrl: null,
                  })
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Certification
              </Button>
            </CardContent>
          </Card>

          {/* Work Experiences Card */}
          <Card>
            <CardHeader>
              <CardTitle>Work Experiences</CardTitle>
              <CardDescription>Add specialist's work history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {experienceFields.length === 0 && (
                <div className="text-center p-4 border border-dashed rounded-md">
                  <p className="text-muted-foreground">
                    No work experience added yet
                  </p>
                </div>
              )}

              {experienceFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-md relative">
                  <div className="absolute right-2 top-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeExperience(index)}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <FormField
                      control={form.control}
                      name={`experiences.${index}.company`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company/Organization</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Skin Care Clinic"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`experiences.${index}.position`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Chief Dermatologist"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <FormField
                      control={form.control}
                      name={`experiences.${index}.startDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={`w-full pl-3 text-left font-normal ${
                                    !field.value ? "text-muted-foreground" : ""
                                  }`}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date > new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`experiences.${index}.endDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            End Date (Leave empty if current)
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={`w-full pl-3 text-left font-normal ${
                                    !field.value ? "text-muted-foreground" : ""
                                  }`}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Still working here</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value || undefined}
                                onSelect={field.onChange}
                                disabled={(date) => date > new Date()}
                                initialFocus
                              />
                              <div className="p-3 border-t border-border">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="w-full justify-center text-sm"
                                  onClick={() =>
                                    form.setValue(
                                      `experiences.${index}.endDate`,
                                      null
                                    )
                                  }
                                >
                                  Clear (Still Working Here)
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`experiences.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your responsibilities and achievements..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() =>
                  appendExperience({
                    company: "",
                    position: "",
                    description: "",
                    startDate: new Date(),
                    endDate: null,
                  })
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Work Experience
              </Button>
            </CardContent>
          </Card>

          {/* Education Card */}
          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
              <CardDescription>
                Add specialist's educational background
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {educationFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-md relative">
                  <div className="absolute right-2 top-2">
                    {educationFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEducation(index)}
                        className="h-8 w-8 text-destructive"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <FormField
                      control={form.control}
                      name={`educations.${index}.institution`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Institution</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Harvard Medical School"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`educations.${index}.major`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Major/Field of Study</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Dermatology" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name={`educations.${index}.degree`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Degree</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select degree" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ASSOCIATE">
                                Associate
                              </SelectItem>
                              <SelectItem value="BACHELOR">Bachelor</SelectItem>
                              <SelectItem value="MASTER">Master</SelectItem>
                              <SelectItem value="DOCTORATE">
                                Doctorate
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`educations.${index}.startYear`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Year</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1950"
                              max={new Date().getFullYear()}
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`educations.${index}.endYear`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Year (Empty if studying)</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                min={
                                  form.watch(`educations.${index}.startYear`) ||
                                  1950
                                }
                                max={new Date().getFullYear() + 10}
                                value={field.value === null ? "" : field.value}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === "") {
                                    field.onChange(null);
                                  } else {
                                    field.onChange(
                                      parseInt(value) || field.value
                                    );
                                  }
                                }}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  form.setValue(
                                    `educations.${index}.endYear`,
                                    null
                                  )
                                }
                                className="whitespace-nowrap"
                              >
                                Still Studying
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() =>
                  appendEducation({
                    institution: "",
                    degree: "BACHELOR",
                    major: "",
                    startYear: new Date().getFullYear() - 4,
                    endYear: new Date().getFullYear(),
                  })
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Education
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="px-8">
              {isSubmitting ? "Creating..." : "Create Specialist Account"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default AddSpecialistForm;
