"use server";
import database from '@/app/msdb.save';

export const saveClick = async (d: number): Promise<void> => {
    const dataDB = database('ALL')("ALLCLICK");
    let click = dataDB.find('any');
    click.value = click.value + d;
    dataDB.save('any', click.value);
}

export const getClick = async (): Promise<number> => {
    const dataDB = database('ALL')("ALLCLICK");
    const click = dataDB.find('any');
    return click.value;
}

export const getViews = async (): Promise<number> => {
    const dataDB = database('ALL')("ALLSEE");
    let click = dataDB.find('any');
    click.value = click.value + 1;
    dataDB.save('any', click.value);
    return click.value;
}

export const saveHighScores = async (highScores: HighScore[]): Promise<void> => {
    const dataDB = database('ALL')("HIGHSCORES");
    dataDB.save('highScores', highScores);
}

export const getHighScores = async (): Promise<HighScore[]> => {
    const dataDB = database('ALL')("HIGHSCORES");
    const highScores = dataDB.find('highScores');
    return highScores?.value || [];
}

interface HighScore {
    name: string;
    score: number;
    spawnRate: number;
}
