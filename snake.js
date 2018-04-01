const collides = (square1, square2) =>
	square1.x == square2.x && square1.y == square2.y;

const collides_with_snake = (snake, square) =>
	snake.reduce((out, segment) => out || collides(segment, square), false)

// weird math becuase JS modulo
// stackoverflow.com/questions/4467539/javascript-modulo-not-behaving
const mod = (m, n) =>
	((m % n) + n) % n

class SnakeGame {
	constructor(ctx){
		this.new_game()
		this.ctx = ctx
	}
	new_game() {
		this.dims = [25, 25];
		this.gamesize = 400;
		this.snake = [{x: 5, y:5}];
		this.new_apple();
		this.direction = null;
		this.next_direction = null;
		/*this.input_queue = [];*//*IMPROVE: innecesary attribute*/
	}
	/*collides_with(snake, square) {
		return snake.reduce(
			(dead, segment) => collides(segment, new_segment), 
		false)
	}*//*IMPROVE: innecesary method*/
	new_apple() {
		if (this.snake.length >= this.dims[0] * this.dims[1]) this.new_game();/*si la serpiente llena el tablero se reinicia el juego*/
		do {
			this.apple = {
				x: Math.floor(Math.random() * this.dims[0]),
				y: Math.floor(Math.random() * this.dims[1]),
			}
		} while (collides_with_snake(this.snake, this.apple));
	}
	is_dead(new_segment) {
		/*UNDERSTANDING: con slide quida el primer segmento, la cabeza puede colisionar con el
		 resto del cuerpo pero no con el último segmento de la cola, que se quitará 
		 porque se va moviendo*/
		return collides_with_snake(this.snake.slice(1), new_segment);
	}
	is_crash_wall(head,new_segment){
		/*the head can be in the border but if the next movement is against the wall it die*/
		if (head.x === 0 && new_segment.x === this.dims[0]-1
			|| head.x === this.dims[0]-1 && new_segment.x === 0
			|| head.y === 0 && new_segment.y === this.dims[1]-1
			|| head.y === this.dims[1]-1 && new_segment.y === 0) {
				return true;
		} else{
			return false;
		}
	}
	step() {
		this.direction = this.get_next_direction();
		if (!this.direction) return;
		const head = this.snake[this.snake.length - 1];
		let [dx, dy] = this.dims;
		const new_segment = {

			x: mod(head.x + this.direction.x, dx),
			y: mod(head.y + this.direction.y, dy),
		};
		
		/*now evaluate if the snake crash against the wall*/
		if (this.is_dead(new_segment) || this.is_crash_wall(head, new_segment)) {
			this.new_game();
			return;
			/*IMPROVE: when the game restart the snake has the correct segments*/
		}

		if (collides(new_segment, this.apple)){
			this.new_apple();
		} else if (this.snake.length > 5) {
			this.snake.shift();
			/*UNDERSTANDING: cuando la inicia la serpiente es de un sólo cuadro, crece hasta que tenga longitud 5
			despues de eso sólo crece si colisiona con la manzana.
			cuando no colisiona se remueve el primer segmento del arreglo, la cabeza del array es la cola de la serpiente*/
		}
		this.snake.push(new_segment);/*UNDERSTANDING: agrega el segmento al final del arreglo, la cola del array es la cabeza de la serpiente*/
		/*this.draw()*//*IMPROVE: call this.draw() is redundant. The method is called in snake.html*/
		
		/*UNDERSTANDING: en cada paso se crea un nuevo segmento según la dirección en la que vaya la serpiente
		se mira si el nuevo segmento colisiona con el cuerpo de la serpiente, si así es reinicia el juego
		se mira si el nuevo segmento colisiona con la manzana, si así es se crea una nueva y no se borra un segmento porlo que la serpiente va creciendo
		se agrega el nuevo segmento a la serpiente habiendo eliminado el primero y se manda a dibujar*/
	}
	draw() {
		this.ctx.clearRect(0, 0, this.gamesize + 11, this.gamesize + 11);
		this.ctx.fillStyle = "black";
		this.ctx.strokeStyle = "black 2px solid";
		let dimx, dimy, sx, sy;
		[dimx, dimy] = this.dims;
		sx = (this.gamesize / dimx);
		sy = (this.gamesize / dimy);

		this.ctx.strokeRect(10, 10, this.gamesize, this.gamesize)
		for (let segment of this.snake) {
			let {x, y} = segment;
			this.ctx.fillRect(10 + sx * x, 10 + sy * y, sx - 1, sy - 1);
		}
		this.ctx.fillStyle = "red";
		let {x, y} = this.apple;
		this.ctx.fillRect(10 + sx * x, 10 + sy * y, sx, sy);
	}
	get_next_direction() {
		if (!this.next_direction) return this.direction;
		if (!this.direction) return this.next_direction;
		let {x, y} = this.next_direction;
		if ( (x == this.direction.x || y == this.direction.y))
			return this.direction; // cannot eat self
		return this.next_direction;
	}
	keypress(event) {
		this.next_direction = {
			37: {x: -1, y: 0 }, // Left
			38: {x: 0 , y: -1}, // Up
			39: {x: 1 , y: 0 }, // Right
			40: {x: 0 , y: 1 }, // Down
		}[event.keyCode] || this.next_direction;
	}
}

