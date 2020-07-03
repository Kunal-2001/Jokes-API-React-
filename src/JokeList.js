import React, { Component } from 'react';
import Joke from './Joke.js';
import axios from 'axios';
import './JokeList.css';
import { v4 as uuidv4 } from 'uuid';

class JokeList extends Component {
	static defaultProps = {
		numJokesToFetch: 10
	};
	constructor(props) {
		super(props);
		this.state = { jokes: JSON.parse(window.localStorage.getItem('jokes') || '[]'), loading: false };
		this.getMoreJokes = this.getMoreJokes.bind(this);

		this.duplicateJokes = new Set(this.state.jokes.map((j) => j.text));
	}
	componentDidMount() {
		if (this.state.jokes.length === 0) {
			this.getJokes();
		}
	}

	async getJokes() {
		try {
			let jokes = [];
			while (jokes.length < this.props.numJokesToFetch) {
				let res = await axios.get('https://icanhazdadjoke.com', { headers: { Accept: 'application/json' } });
				let newJoke = res.data.joke;
				if (!this.duplicateJokes.has(newJoke)) {
					jokes.push({ text: newJoke, votes: 0, id: uuidv4() });
				} else {
					console.log('You have a duplicate in the storage ');
					console.log(newJoke);
				}
			}

			this.setState(
				(st) => ({
					loading: false,
					jokes: [ ...st.jokes, ...jokes ]
				}),
				() => window.localStorage.setItem('jokes', JSON.stringify(this.state.jokes))
			);
		} catch (err) {
			alert(err);
			this.setState({ loading: false });
		}
	}

	handleJokes(id, delta) {
		this.setState(
			(st) => ({
				jokes: st.jokes.map((j) => (j.id === id ? { ...j, votes: j.votes + delta } : j))
			}),
			() => window.localStorage.setItem('jokes', JSON.stringify(this.state.jokes))
		);
	}

	getMoreJokes() {
		this.setState({ loading: true }, this.getJokes);
	}

	render() {
		if (this.state.loading) {
			return (
				<div className="loader">
					<i className="far fa-8x fa-laugh fa-spin" />
					<h1 className="Title">Loading....</h1>
				</div>
			);
		}
		let jokes = this.state.jokes.sort((a, b) => b.votes - a.votes);
		return (
			<div className="Joke-List">
				<div className="Joke-List-Sidebar">
					<h1 className="Title">
						<span>Jokes</span> API
					</h1>
					<img src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg" />
					<button onClick={this.getMoreJokes} className="Joke-List-button">
						Get More
					</button>
				</div>
				<div className="Joke-List-Jokes">
					{jokes.map((j) => (
						<Joke
							upvote={() => this.handleJokes(j.id, 1)}
							downvote={() => this.handleJokes(j.id, -1)}
							key={j.id}
							votes={j.votes}
							text={j.text}
						/>
					))}
				</div>
			</div>
		);
	}
}

export default JokeList;
