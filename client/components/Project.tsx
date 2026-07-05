import { ProjectType } from "@/types/dashboard";
import { MouseEvent } from "react";
import { useRouter } from "next/navigation";

interface ExtendedProjectType extends ProjectType {
  onDelete?: (id: number) => void;
}

const Project = (props: ExtendedProjectType) => {
  const navigate = useRouter();

  // Prevent the card's main onClick from firing when clicking inner buttons
  const handleEdit = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    navigate.push(`/dashboard/projects/edit/${props.id}`);
  };

  const handleDelete = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (props.onDelete) {
      props.onDelete(props.id);
    }
  };

  return (
    <div
      onClick={props.onClick}
      className="group flex flex-col justify-between h-full min-h-[160px] bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
    >
      {/* Top Section: Icon & Details */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors">
          <img
            src={props.img}
            alt={`${props.title} icon`}
            className="w-7 h-7 object-contain drop-shadow-sm"
          />
        </div>

        <div className="flex flex-col overflow-hidden pt-1">
          <h3 className="font-semibold text-gray-800 text-lg leading-tight truncate group-hover:text-blue-600 transition-colors">
            {props.title}
          </h3>
          <p className="text-sm text-gray-400 mt-1 truncate">
            Click to open workspace
          </p>
        </div>
      </div>

      {/* Bottom Section: Footer Actions */}
      <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100">
        <span className="text-xs font-medium text-gray-400">
          Edited {props.lastEdited || "Recently"}
        </span>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleEdit}
            className="text-xs font-semibold text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded transition-colors"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="text-xs font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 px-2 py-1.5 rounded transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default Project;
