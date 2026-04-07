import type { Task } from "../types/Task";
import { format } from "date-fns";

type Props = {
  formData: Task;
  setFormData: React.Dispatch<React.SetStateAction<Task | null>>;
};

const TaskEditForm = ({ formData, setFormData }: Props) => {
  return (
    <>
      <input
        className="editable-input"
        type="text"
        value={formData.title}
        onChange={(e) =>
          setFormData((prev) => ({
            ...(prev as Task),
            title: e.target.value,
          }))
        }
      />

      <textarea
        id="description-input"
        value={formData.description}
        onChange={(e) =>
          setFormData((prev) => ({
            ...(prev as Task),
            description: e.target.value,
          }))
        }
      />
      <label>
        Priority:
        <input
          className="editable-input"
          type="number"
          value={formData.priority}
          onChange={(e) =>
            setFormData((prev) => ({
              ...(prev as Task),
              priority: Number(e.target.value),
            }))
          }
        />
      </label>
      <label>
        Deadline:
        <input
          className="editable-input"
          type="date"
          value={format(formData.deadline, "yyyy-MM-dd")}
          onChange={(e) =>
            setFormData((prev) => ({
              ...(prev as Task),
              deadline: new Date(e.target.value),
            }))
          }
        />
      </label>
      <label>
        Completed:
        <input
          className="editable-input"
          type="checkbox"
          checked={formData.done}
          onChange={(e) =>
            setFormData((prev) => ({
              ...(prev as Task),
              done: e.target.checked,
            }))
          }
        />
      </label>
    </>
  );
};

export default TaskEditForm;