import pygame
from queue import Queue, PriorityQueue

RED = (255, 0, 0)
GREY = (220,220,220)
DARK_GREY = (169, 169, 169)
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
GREEN = (60, 179, 113)
PURPLE = (106, 90, 205) # goal color
ORANGE = (255, 165, 0) #start color

WIDTH = 700
rect_per_row = 50

rect_width = WIDTH/rect_per_row


class Grid:
        def __init__(self, num_rects):
                self.num_rects = num_rects
                self.walls = []

        def grid_matrix(self):
                matrix = []
                for x in range(self.num_rects):
                    matrix.append([])
                    for y in range(self.num_rects):
                        matrix[x].append((x,y))
                return matrix

        def in_bounds(self, pos):
                x, y = pos
                return 0 <= x < self.num_rects  and 0 <= y < self.num_rects
                

        def neighbors(self, pos):
                x, y = pos
                return [(x+1, y),(x, y+1),(x-1, y),(x, y-1)]

        def draw_rect(self, pos):
                pos_x, pos_y = pos
                pygame.draw.rect(display, GREY, [(rect_width * pos_x, rect_width * pos_y), (rect_width - 1, rect_width -1)])
                pygame.display.update()
                

        def draw_final_path(self, came_from, start, goal):
                pos = goal
                while came_from[pos] != start:
                        pos_x, pos_y = came_from[pos]
                        pygame.draw.rect(display, GREEN, [(rect_width * pos_x, rect_width * pos_y), (rect_width - 1, rect_width -1)])
                        pos = (pos_x, pos_y)

                        
                        


class Algorithm:
        def __init__(self):
                pass
        
        def heuristic(self, pos_1, pos_2):
                x1, y1 = pos_1
                x2, y2 = pos_2
                return abs(x2-x1) + abs(y2-y1)

        # Greedy Best Frist doesn't gurantee the shortest path.
        # GBFuses heuristic as the priority number
        
        def greedy_best_first(self, Grid, start, goal):
                frontier  = PriorityQueue()
                frontier.put((0, start))
                came_from = {start: None}

                while not frontier.empty():
                        current = frontier.get()[1]

                        if current == goal:
                                break
                        if current != start:
                                grid.draw_rect(current)
                        for next in grid.neighbors(current):
                                if grid.in_bounds(next) and next not in came_from and next not in grid.walls:
                                        priority = self.heuristic(goal, next)
                                        frontier.put((priority, next))
                                        came_from[next] = current
                grid.draw_final_path(came_from, start, goal)

        # Dijkstra Search guarantees the shortest path.
        # DS uses g_score as the priorty number.
        # Takes longer than A* to find a path
        
        def dijkstra_search(self, Grid, start, goal):
                frontier  = PriorityQueue()
                frontier.put((0, start))
                came_from = {start: None}
                g_score = {start: 0}

                while not frontier.empty():
                        current = frontier.get()[1]

                        if current == goal:
                                break
                        if current != start:
                                grid.draw_rect(current)
                        for next in grid.neighbors(current):
                                if grid.in_bounds(next) and next not in came_from and next not in grid.walls:
                                        new_g_score = g_score[current] + 1
                                        g_score[next] = new_g_score
                                        #F-score == priority
                                        priority = new_g_score
                                        frontier.put((priority, next))
                                        came_from[next] = current
                grid.draw_final_path(came_from, start, goal)
                
        

        # A* guarantess the shortest path
        # A* uses F-Score ( f = g + h ) as the priority number.
        # g = cost from start to current position.
        # h = estimated cost from the current position to the goal. (h == heuristic)
        
        def A_Star(self, Grid, start, goal):
                frontier  = PriorityQueue()
                frontier.put((0, start))
                came_from = {start: None}
                g_score = {start: 0}

                while not frontier.empty():
                        current = frontier.get()[1]

                        if current == goal:
                                break
                        if current != start:
                                grid.draw_rect(current)
                        for next in grid.neighbors(current):
                                if grid.in_bounds(next) and next not in came_from and next not in grid.walls:
                                        new_g_score = g_score[current] + 1
                                        g_score[next] = new_g_score
                                        #F-score == priority
                                        priority = new_g_score + self.heuristic(goal, next)
                                        frontier.put((priority, next))
                                        came_from[next] = current
                grid.draw_final_path(came_from, start, goal)


grid = Grid(rect_per_row)

matrix = grid.grid_matrix()
start = None
goal = None




pygame.init()
WINDOW_SIZE = (WIDTH, WIDTH)
display = pygame.display.set_mode(WINDOW_SIZE)

pygame.display.set_caption('Drawing Grid')

done = False

display.fill(DARK_GREY)
for row in range(rect_per_row):
        for column in range(rect_per_row):
            pygame.draw.rect(display, WHITE, [(rect_width * row, rect_width* column), (rect_width - 1, rect_width -1)])

while not done:
    
    
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            done = True

             
        elif pygame.mouse.get_pressed()[0]==True:
            x, y = pygame.mouse.get_pos()
            pos_y = int(y // rect_width)
            pos_x = int(x // rect_width)

            if start == None:
                    pygame.draw.rect(display, ORANGE, [(rect_width * pos_x, rect_width * pos_y), (rect_width - 1, rect_width -1)])
                    start = (pos_x, pos_y)
                    print('start: ',  start)
                        
            elif goal == None:
                    pygame.draw.rect(display, PURPLE, [(rect_width * pos_x, rect_width * pos_y), (rect_width - 1, rect_width -1)])
                    goal = (pos_x, pos_y)   
                    print('goal: ' , goal)    
                    
            elif (pos_x, pos_y) != start and (pos_x, pos_y) != goal:          
                    pygame.draw.rect(display, BLACK, [(rect_width * pos_x, rect_width * pos_y), (rect_width - 1, rect_width -1)])
                    grid.walls.append((pos_x, pos_y))  
                    print("Click ", (x, y), "Grid coordinates: ", pos_x, pos_y)

        elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE and start and goal:
                        Algorithm().A_Star(grid, start, goal)
                                       


    pygame.display.flip()
pygame.quit()


