export interface Command<TState> {
  do: (state: TState) => TState;
  undo: (state: TState) => TState;
  group?: string;
}

export class CommandStack<TState> {
  private undoStack: Command<TState>[] = [];
  private redoStack: Command<TState>[] = [];

  execute(state: TState, command: Command<TState>) {
    const next = command.do(state);
    const last = this.undoStack[this.undoStack.length - 1];
    if (last?.group && command.group && last.group === command.group) {
      this.undoStack[this.undoStack.length - 1] = command;
    } else {
      this.undoStack.push(command);
    }
    this.redoStack = [];
    return next;
  }

  undo(state: TState) {
    const cmd = this.undoStack.pop();
    if (!cmd) return state;
    this.redoStack.push(cmd);
    return cmd.undo(state);
  }

  redo(state: TState) {
    const cmd = this.redoStack.pop();
    if (!cmd) return state;
    this.undoStack.push(cmd);
    return cmd.do(state);
  }

  canUndo() { return this.undoStack.length > 0; }
  canRedo() { return this.redoStack.length > 0; }
}
