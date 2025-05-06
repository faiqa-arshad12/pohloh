import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import Tag from "@/components/ui/tags";
import Image from "next/image";
import {Input} from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TagType = {
  name: string;
  image: string;
};

type FormValues = {
  name: string;
  seatType: string;
  team: string;
  currentTeam: string;
  role: string;
  teamMembers: TagType[];
};
type EditLeadModalContentProps = {
  open: boolean;
  onClose: (open: boolean) => void;
};
export default function EditLeadModal({ open, onClose }: EditLeadModalContentProps) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>();
  const [teamMembers, setTeamMembers] = useState<TagType[]>([
    {name: "Sara", image: "https://i.pravatar.cc/40?img=1"},
    {name: "Maaz", image: "https://i.pravatar.cc/40?img=2"},
  ]);


  const form = useForm<FormValues>({
    defaultValues: {
      name: "Maaz",
      seatType: "standard",
      team: "design",
      currentTeam: "Amjad",
      role: "designer",
      teamMembers: teamMembers,
    }
  });

  const handleClose = () => {onClose(false); setIsModalOpen(false)};

  const handleSave = (data: FormValues) => {
    alert(JSON.stringify(data, null, 2));
    onClose(false);
    setIsModalOpen(false)
  };
  useEffect(() => {
    setIsModalOpen(open);
  },[open]);

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="overflow-y-auto w-full max-w-[864px]  h-auto text-white border-none bg-[#0E0F11]">
        <DialogHeader>
          <DialogTitle className="text-[32px]">Edit Lead</DialogTitle>
        </DialogHeader>

        <div className="bg-[#828282] h-[1px]" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="py-5 space-y-8">
            {/* Lead Name */}
            <FormField
              control={form.control}
              name="name"
              render={({field}) => (
                <FormItem>
                  <FormLabel className="text-white font-urbanist text-[16px]">
                    Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="w-full p-2 bg-[#FFFFFF14] h-[44px] text-[#FFFFFF52] rounded-md border-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Seat Type Selection */}
            <FormField
              control={form.control}
              name="seatType"
              render={({field}) => (
                <FormItem>
                  <FormLabel className="text-white font-urbanist text-[16px]">
                    Select the Seat Type
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger
                        className="w-full bg-[#FFFFFF14] border-none hover:bg-[#FFFFFF14] text-[#FFFFFF52] rounded-md p-2 h-[44px]"
                      >
                        <SelectValue placeholder="Select seat type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#1A1A1C] z-[9999] border border-[#FFFFFF0F] text-white">
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                      <SelectItem value="executive">Executive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Team Selection */}
            <FormField
              control={form.control}
              name="team"
              render={({field}) => (
                <FormItem>
                  <FormLabel className="text-white font-urbanist text-[16px]">
                    Select the Team
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger
                        className="w-full bg-[#FFFFFF14] border-none hover:bg-[#FFFFFF14] text-[#FFFFFF52] rounded-md p-2 h-[44px]"
                      >
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#1A1A1C] z-[9999] border border-[#FFFFFF0F] text-white">
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Current Team */}
            <FormField
              control={form.control}
              name="currentTeam"
              render={({field}) => (
                <FormItem>
                  <FormLabel className="text-white font-urbanist text-[16px]">
                    Current Team
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="w-full p-2 bg-[#FFFFFF14] text-[#FFFFFF52] rounded-md h-[44px] border-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Role Selection */}
            <FormField
              control={form.control}
              name="role"
              render={({field}) => (
                <FormItem>
                  <FormLabel className="text-white font-urbanist text-[16px]">
                    Select Role
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger
                        className="w-full bg-[#FFFFFF14] border-none hover:bg-[#FFFFFF14] text-[#FFFFFF52] rounded-md p-2 h-[44px]"
                      >
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#1A1A1C] z-[9999] border border-[#FFFFFF0F] text-white">
                      <SelectItem value="designer">Designer</SelectItem>
                      <SelectItem value="developer">Developer</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Manage Team Member */}
            <FormField
              control={form.control}
              name="teamMembers"
              render={({field}) => (
                <FormItem>
                  <FormLabel className="text-white font-urbanist text-[16px]">
                    Manage Team Member
                  </FormLabel>
                  <FormControl>
                    <div className="w-full border border-[#FFFFFF0F] bg-[#FFFFFF14] rounded-[6px]">
                      <Tag
                        initialTags={field.value}
                        onTagsChange={(tags) => field.onChange(tags)}
                        confirmBeforeAdd={false}
                        className="w-full"
                        classNameTag="bg-[#F9DB6F] h-[34px] text-black px-3 rounded-sm flex items-center text-sm gap-2 max-w-[calc(100%-32px)]"
                        classNameTagRemove="text-lg font-bold leading-none focus:outline-none bg-transparent hover:bg-transparent text-black"
                       //@ts-expect-error: have some error with types
                        ClassNameAddtag="h-[34px] text-white p-3 rounded-sm flex items-center text-sm max-w-[calc(100%-32px)] gap-2 bg-[#00000033] hover:bg-[#00000033]"

                        renderTag={(tag: TagType) => (
                          <div className="flex items-center gap-2">
                            <Image
                              src={tag.image}
                              alt={tag.name}
                              width={24}
                              height={24}
                              className="rounded-full object-cover"
                            />
                            <span>{tag.name}</span>
                          </div>
                        )}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 p-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-[#FFFFFF14] text-white hover:bg-[#FFFFFF14] rounded-md p-2 border font-urbanist font-medium text-[16px] leading-[24px] tracking-[0px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#F9E36C] text-black hover:bg-[#f8d84e] rounded-md p-2 font-urbanist font-medium text-[16px] leading-[24px] tracking-[0px]"
              >
                Save
              </button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}