import { Button, Modal } from "@heroui/react";
import { useState } from "react";

import type { ProjectEntry } from "../../catalog/types";
import { useProjectProgress } from "../../hooks/useProjectProgress";
import { clearProjectProgress, notifyProgressChange } from "../../lib/progress/storage";

interface GuideResetButtonProps {
  project: ProjectEntry;
  className?: string;
}

/** Clears stored step completion for every subguide in a project after confirmation. */
export function GuideResetButton({ project, className }: GuideResetButtonProps) {
  const { statusBySlug } = useProjectProgress(project);
  const [open, setOpen] = useState(false);

  const hasProgress = Object.values(statusBySlug).some((status) => status !== "not-started");

  if (!hasProgress) {
    return null;
  }

  const guideSlugs = project.subguides.map((subguide) => subguide.slug);

  return (
    <>
      <button
        className={className}
        onClick={() => setOpen(true)}
        type="button"
      >
        Reset Project Guides
      </button>

      <Modal>
        <Modal.Backdrop isOpen={open} onOpenChange={setOpen} variant="blur">
          <Modal.Container placement="center">
            <Modal.Dialog aria-label="Reset project guide progress">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>Reset project guides?</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <p className="text-default-600">
                  All progress marked across every guide in this project will be cleared. You
                  can complete the project again from the start.
                </p>
              </Modal.Body>
              <Modal.Footer>
                <Button onPress={() => setOpen(false)} variant="secondary">
                  Cancel
                </Button>
                <Button
                  className="bg-danger text-white hover:bg-danger-600"
                  onPress={() => {
                    clearProjectProgress(project.id, guideSlugs);
                    notifyProgressChange();
                    setOpen(false);
                  }}
                >
                  Reset project guides
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
