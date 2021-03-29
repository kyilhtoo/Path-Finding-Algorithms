/*
This JavaScript is fully working but would not sometimes update the start and goal square real time on the visual side though would run
the path finding algorithm correctly.
 */




let num_rows = 20;
let num_columns = 60; //don't forget to change the column numbers in css grid after you changed this

let select = false;
let start = null;
let goal = null;
let walls = []
let color_change_interval = 5; //set the interval of the color change on grid

let allow_auto_run = false;
let goal_img_dragged = false;
let start_img_dragged = false;




function selected_algorithm(){
    return document.getElementById('selected_algorithm').value;
}



//time out before drawing the final path
function time_out(array, interval = color_change_interval){
    return (array.length * interval)
}

function drag_item_square_update(){
        document.getElementById(start).appendChild(document.getElementById('start_img'));
        document.getElementById(goal).appendChild(document.getElementById('goal_img'));
}




function reset_square_color(){
    let total_squares = (num_rows * num_columns);
    for (let i = 0; i < total_squares; i++){
        change_color(i);
    }
}

function color_walls(walls){
    for (let num = 0; num < walls.length; num++){
        console.log(walls[num]);
        change_color(walls[num], '--walls-color', '--walls-border-color');
    }
}


/*color of the squares must be changed through css variables*/
function change_color(id, background_color = '--square-defualt-color', border_color = '--square-default-border-color'){
    let bg_color = getComputedStyle(document.body).getPropertyValue(background_color);
    let bdr_color = getComputedStyle(document.body).getPropertyValue(border_color);
    document.getElementById(id).style.background = bg_color;
    document.getElementById(id).style.borderColor = bdr_color;
}


function deselect(){
    select = false;
}

function remove_help(){
    document.getElementById('help-button').style.display = 'none';
}



/*Grid*/

function squares(){
    var rows = num_rows;
    var columns = num_columns;
    var no_squares = (rows * columns);
    let text = "";
    for (num =0; num < no_squares; num++){
        text += "<div class='square' id='"+ num +"' ondrop='drop(event), image_undragged()' ondragover='allowDrop(event)' ondragenter='auto_pathfind()' onmouseover='drag_into_walls()' onclick='select_square()' oncontextmenu='delete_walls(event)' '></div>";
        }
    document.getElementById('grid-container').innerHTML = text;
}


function auto_pathfind(color_change_rate='fast'){
    if (allow_auto_run){
        update_start_goal();
        /*let id_no = event.target.id;
        if (start_img_dragged){
            start = parseInt(id_no);
        }
        if (goal_img_dragged){
            goal = parseInt(id_no);
        }
*/
        reset_square_color();
        color_walls(walls);
        if (selected_algorithm() === '1'){
           A_Star(color_change_rate);
        } else {
           Dijkstra_search(color_change_rate);
        }
    }
}



function draw_final_path(came_from){
    let pos = goal;
    while (came_from[pos] !== start){
        pos = came_from[pos];
        change_color(pos, '--final-path-color');
    }
}

function image_dragged(){
    let id = event.target.id;
    if (id === 'start_img'){
        start_img_dragged = true;
    }
    if (id === 'goal_img'){
        goal_img_dragged = true;
    }
}

function image_undragged(){
    start_img_dragged = false;
    goal_img_dragged = false;
}



/*
function drag(){
     event.dataTransfer.setData("text", event.target.id);
}*/

function drop(event){
    event.preventDefault();
    update_start_goal();


    /*let id_no = event.target.id;
        if (start_img_dragged){
            start = parseInt(id_no);
        }
        if (goal_img_dragged){
            goal = parseInt(id_no);
        }*/



    /*var data = event.dataTransfer.getData("text");
    console.log(data);
    event.target.appendChild(document.getElementById(data));
    if (data === 'start_img'){
       start = parseInt(event.target.id);
    }
    if (data === 'goal_img'){
        goal = parseInt(event.target.id);
    }*/
}

function allowDrop(event){
    event.preventDefault();
}

function select_square(){
    let pos = event.target.id;
    if (select === true){
        select = false;
    } else if (event.target.id !== 'start_img' && event.target.id !== 'goal_img'){
        select =true;
        add_to_walls();
    }
}


function add_to_walls(){
    let pos = event.target.id;
    if (pos == 'start_img' || pos === 'goal_img'){
        return
    }

    pos = parseInt(event.target.id);
    if (walls.includes(pos) === false && pos !== start && pos !== goal){
        walls.push(pos);
        change_color(pos,'--walls-color', '--walls-border-color');
    }
}


function drag_into_walls(){
    if (select){
        add_to_walls();
    }
}


function delete_walls(){
    event.preventDefault();
    select = false;
    let square = parseInt(event.target.id);
    if (walls.includes(square)){
        walls.splice(walls.indexOf(square),1);
        change_color(square, '--square-defualt-color');
    }
}


/* Path Finding Algorithms */


function neighbors(pos){
    let all_neighbors, temp;
    let final = [];
    /* Remove the nodes that are out of bound */

    if (pos % num_columns === 0){
        all_neighbors = [(pos +1), (pos + num_columns) , (pos-num_columns)];
    } else if (pos % num_columns === (num_columns -1)) {
        all_neighbors = [(pos -1), (pos + num_columns) , (pos-num_columns)];
    } else {
        all_neighbors = [(pos +1), (pos-1), (pos + num_columns) , (pos-num_columns)];
    }

    for (let i = 0; i < all_neighbors.length; i++){
        temp = all_neighbors[i];
        if (temp >= 0 && temp < (num_columns*num_rows)){
            final.push(temp);
        }
    }
    return final
}











function draw_reached_square(arr, interval_time = color_change_interval, square_color = '--searched-square-color'){
    let array = arr;
    let draw = setInterval(function(){
        if (array.length === 0){
        clearInterval(draw);
    } else {
        let id = parseInt(array.splice(0, 1));
        change_color(id, square_color)
    }
    }, interval_time);
}


function get_x_y(pos){
    let position = parseInt(pos);
    return [position % num_columns, Math.floor(position / num_columns)]
}


function manhattan_distance(pos_1, pos_2){
    let x1_y1 = get_x_y(pos_1);
    let x2_y2 = get_x_y(pos_2);
    let x1 = x1_y1[0];
    let y1 = x1_y1[1];
    let x2 = x2_y2[0];
    let y2 = x2_y2[1];
    return (Math.abs(x2-x1) + Math.abs(y2-y1))
}


function Dijkstra_search(color_change_rate = 'slow'){
    let frontier = [];
    frontier.push([0, start]);
    let came_from = {};
    came_from[start] = null;
    let g_score = {};
    g_score[start] = 0;
    var current, surroundings, next, new_g_score;

    let reached = [];

    while (frontier.length !== 0){
        frontier.sort(function(a, b) {
            return a[0] - b[0];
        });

        current = frontier.shift()[1];
        if (current === goal){
            break
        }

        if (!(current === start)){
            reached.push(current);
        }


        surroundings = neighbors(current);
        for (var num = 0; num < surroundings.length; num++){
            next = surroundings[num];
            if (!(next in came_from) && !(walls.includes(next))){
                new_g_score = (g_score[current] + 1);
                g_score[next] = new_g_score;
                frontier.push([new_g_score, next]);
                came_from[next] = current;
            }
        }
    }
    if (color_change_rate === 'slow'){
        draw_reached_square(reached); //drawing position of reached squares
        let interval = (time_out(reached) + 500);
        setTimeout(draw_final_path, interval, came_from); //allow finishing the drawing of the reached squares
    } else if (color_change_rate === 'fast'){
        for (let i = 0; i < reached.length; i++){
        change_color(reached[i], '--searched-square-color');
        }
        draw_final_path(came_from);
    }
}



function A_Star(color_change_rate = 'slow'){
    let frontier = [];
    frontier.push([0, start]);
    let came_from = {};
    came_from[start] = null;
    let g_score = {};
    g_score[start] = 0;
    let current, surroundings, next, new_g_score;
    let reached = [];

    while (frontier.length !== 0){
        frontier.sort(function(a, b) {
            return a[0] - b[0];
        });

        current = frontier.shift()[1];
        if (current === goal){
            break
        }

        if (!(current === start)){
            reached.push(current);
        }


        surroundings = neighbors(current);
        for (var num = 0; num < surroundings.length; num++){
            next = surroundings[num];
            if (!(next in came_from) && !(walls.includes(next))){
                new_g_score = (g_score[current] + 1);
                g_score[next] = new_g_score;

                // priority == f-score
                let priority = new_g_score + manhattan_distance(goal, next);
                frontier.push([priority, next]);
                came_from[next] = current;
            }
        }
    }
    if (color_change_rate === 'slow'){
        draw_reached_square(reached); //drawing position of reached squares
        let interval = (time_out(reached) + 500);
        setTimeout(draw_final_path, interval, came_from); //allow finishing the drawing of the reached squares
    } else if (color_change_rate === 'fast'){
        for (let i = 0; i < reached.length; i++){
        change_color(reached[i], '--searched-square-color');
        }
        draw_final_path(came_from);
    }
}



// 'fast' to instantly update colors and 'slow' to show the color update process
function start_pathfinding(color_change_rate = 'slow'){
    if (start == null || goal == null){
        alert('You must place both the starting position and destination on the grid.')
    } else {
        reset_square_color();
        color_walls(walls);
        if (selected_algorithm() === '1'){
           A_Star(color_change_rate);
        } else {
            Dijkstra_search(color_change_rate);
        }
    }
    allow_auto_run = true;
}

function reset(){
    location.reload();
}


function update_start_goal(){
    let id_no = event.target.id;
    if (id_no === 'goal_img' || id_no === 'start_img'){
        id_no = event.target.parentElement.id;
    }

    if (start_img_dragged) {
        console.log('goal is'+ goal +'  changing start '+ id_no);
        start = parseInt(id_no);
    }
    if (goal_img_dragged) {
        console.log('start is'+start +'  changing goal '+ id_no);
        goal = parseInt(id_no);
    }
}

