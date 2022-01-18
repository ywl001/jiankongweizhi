import { Component, OnInit} from '@angular/core';
import { Store } from '@ngrx/store';
import * as EventBus from 'eventbusjs';
import { action_searchCamera, action_selectedSearchCamera } from 'src/app/app-state/app-action';
import { selector_searchCameras } from 'src/app/app-state/app-selector';
import { EventType } from 'src/app/models/event-type';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  keyword: string;
  results;
  constructor(private store: Store) { }

  ngOnInit() {
    this.store.select(selector_searchCameras).subscribe(
      results => {
        this.results = results;
      });
  }

  onSearch() {
    this.store.dispatch(action_searchCamera({ keyword: this.keyword }));
  }

  onClickItem(item) {
    // EventBus.dispatch(EventType.SHOW_SEARCH_MARK, item)
    console.log(item)
    this.store.dispatch(action_selectedSearchCamera({camera:item}))
    EventBus.dispatch(EventType.CLOSE_DRAWER)
  }
}
