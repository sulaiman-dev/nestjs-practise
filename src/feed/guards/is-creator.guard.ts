import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { map, Observable, switchMap } from 'rxjs';
import { User } from 'src/auth/model/user.interface';
import { AuthService } from 'src/auth/services/auth.service';
import { FeedService } from '../feed.service';
import { FeedPost } from '../models/post.Interface';

@Injectable()
export class IsCreatorGuard implements CanActivate {
  constructor(private authService: AuthService, private feedService: FeedService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const request = context.switchToHttp().getRequest();
    const {user, params}: {user: User; params: {id: number}} = request
    
    if(!user || !params) return false
    
    if(user.role === "admin") return true // allow admins to get make request

    const userId = user.id;
    const feedId = params.id;

    // Determine if logged-in user is the same as the user that created the post
    return this.authService.findUserById(userId).pipe(
      switchMap((user: User) => this.feedService.getSinglePost(feedId).pipe(
        map((feedPost: FeedPost) => {
          let isAuthor = user.id === feedPost.author.id;
          return isAuthor
        })
      ))
    )
  }
}
