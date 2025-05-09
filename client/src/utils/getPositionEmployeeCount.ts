type Position = {
    position_id: number;
    name: string;
    parent_position_id?: number | null;
    department_id?: number | null;
};

export const getPositionEmployeeCount = (position: Position) => {
    
}