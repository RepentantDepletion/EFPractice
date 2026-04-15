import type { Task } from "../types/Task";
import { format } from "date-fns";

type Props = {
  formData: Task;
  setFormData: React.Dispatch<React.SetStateAction<Task | null>>;
  listOptions: Array<{ id: number; title: string }>;
  recurrenceOptions: Array<{ value: number; label: string }>;
};

const TaskEditForm = ({ formData, setFormData, listOptions, recurrenceOptions }: Props) => {
  return (
    <>
      <input
      placeholder="Input title here"
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

      <select
        className="editable-input"
        value={formData.list ?? ""}
        onChange={(e) =>
          setFormData((prev) => ({
            ...(prev as Task),
            list: e.target.value === '' ? null : e.target.value,
          }))
        }
      >
        <option value="">No List</option>
        {listOptions.map((list) => (
          <option key={list.id} value={String(list.id)}>
            {list.title}
          </option>
        ))}
      </select>


      <textarea
      placeholder="Input Description here"
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
      <label>
        Remind me:
        <select
          className="editable-input"
          value={formData.recurrence}
          onChange={(e) =>
            setFormData((prev) =>
              prev
                ? {
                    ...prev,
                    recurrence: Number(e.target.value) as Task['recurrence'],
                  }
                : prev
            )
          }
        >
          {recurrenceOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

    </>
  );
};

export default TaskEditForm;