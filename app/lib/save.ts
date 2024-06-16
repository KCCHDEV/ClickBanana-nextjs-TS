"use server";
import database from '@/app/msdb.save'

export const saveclick = async (d: number): Promise<void> => {
    const dataDB = database('ALL')("ALLCLICK");
    let click = dataDB.find('any');
    click.value = click.value + d;
    dataDB.save('any', click.value)
}

export const getClick = async (): Promise<number> => {
    const dataDB = database('ALL')("ALLCLICK");
    const click = dataDB.find('any');
    return click.value;
}

export const getViwes = async (): Promise<number> => {
    const dataDB = database('ALL')("ALLSEE");
    let click = dataDB.find('any');
    click.value = click.value + 1;
    dataDB.save('any', click.value)
    return click.value;
}